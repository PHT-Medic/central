import {getRepository} from "typeorm";
import {Train} from "../../../../domains/pht/train";
import {isPermittedToOperateOnRealmResource} from "../../../../modules/auth/utils";
import {createTrainBuilderQueueMessage, publishTrainBuilderQueueMessage} from "../../../../domains/train-builder/queue";
import {
    TrainConfiguratorStateFinished,
    TrainConfiguratorStateHashGenerated,
    TrainStateBuilding,
    TrainStateFinished,
    TrainStateStarted,
    TrainStateStarting,
    TrainStateStopping
} from "../../../../domains/pht/train/states";
import * as crypto from "crypto";
import {getTrainFileFilePath} from "../../../../domains/pht/train/file/path";
import * as fs from "fs";
import {check, matchedData, validationResult} from "express-validator";
import {
    createTrainRouterQueueMessageCommand,
    MQ_TR_COMMAND_START_TRAIN,
    MQ_TR_COMMAND_STOP_TRAIN,
    publishTrainRouterQueueMessage
} from "../../../../domains/train-router/queue";
import {TrainResult} from "../../../../domains/pht/train/result";
import {createResultServiceResultCommand} from "../../../../domains/result-service/queue";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../config/harbor";
import {TrainResultStateOpen} from "../../../../domains/pht/train/result/states";
import {findHarborProjectRepository, HarborRepository} from "../../../../domains/harbor/project/repository/api";

export async function generateTrainHashActionRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {relations: ['files']});

    const hash = crypto.createHash('sha512');
    // User Hash
    hash.update(Buffer.from(entity.user_id.toString(), 'utf-8'));

    console.log('Hashing: UserId: '+entity.user_id);

    for(let i=0; i<entity.files.length; i++) {
        const filePath = getTrainFileFilePath(entity.files[i]);

        const fileContent = fs.readFileSync(filePath);

        console.log('Hashing: File: ', entity.files[i].name, Buffer.from(fileContent).toString('utf-8').length);

        // File Hash
        hash.update(fileContent);
    }

    // Session Id hash
    const sessionId : Buffer = crypto.randomBytes(64);
    console.log('Hashing: SessionId:', entity.session_id);
    hash.update(sessionId);

    const query : Buffer | undefined = !!entity.query && entity.query !== '' ?
        Buffer.from(entity.query, 'utf-8') :
        undefined;

    if(typeof query !== 'undefined') {
        console.log('Hashing: Query', query.length, query.toString('hex'));
        hash.update(query);
    }

    entity.session_id = sessionId.toString('hex');

    entity.hash = hash.digest('hex');
    entity.configurator_status = TrainConfiguratorStateHashGenerated;

    try {
        entity = await repository.save(entity);

        return res._respond({data: entity});
    } catch (e) {
        return res._failBadRequest({message: 'The hash could not be generated...'})
    }
}

/**
 * Execute a train command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function doTrainTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['start', 'stop', 'build','scanHarbor'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {relations: ['stations', 'master_image', 'entrypoint_file']});

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    switch (validationData.task) {
        case "build":
            if(entity.status === TrainStateStarted || entity.status === TrainStateFinished) {
                return res._failBadRequest({message: 'The train can no longer be build...'});
            } else {

                const queueMessage = await createTrainBuilderQueueMessage(entity, 'trainBuild', {
                    token: req.token
                });

                await publishTrainBuilderQueueMessage(queueMessage);

                entity = repository.merge(entity, {
                    configurator_status: TrainConfiguratorStateFinished,
                    status: TrainStateBuilding
                });

                await repository.save(entity);

                return res._respond({data: entity});
            }
        case "start":
            if(entity.status === TrainStateStarted  || entity.status === TrainStateFinished) {
                return res._failBadRequest({message: 'The train has already been started...'});
            } else {
                const queueMessage = await createTrainRouterQueueMessageCommand(entity.id, MQ_TR_COMMAND_START_TRAIN, {
                    token: req.token
                });

                await publishTrainRouterQueueMessage(queueMessage);

                entity = repository.merge(entity, {
                    status: TrainStateStarting
                });

                await repository.save(entity);

                return res._respond({data: entity});
            }
        case "stop":
            if(entity.status === TrainStateFinished) {
                return res._failBadRequest({message: 'The train has already been terminated...'});
            } else {
                const queueMessage = await createTrainRouterQueueMessageCommand(entity.id, MQ_TR_COMMAND_STOP_TRAIN, {
                    token: req.token
                });

                await publishTrainRouterQueueMessage(queueMessage);

                entity = repository.merge(entity, {
                    status: TrainStateStopping
                });

                await repository.save(entity);

                return res._respond({data: entity});
            }
        case "scanHarbor":
            const resultRepository = getRepository(TrainResult);

            const harborRepository : HarborRepository | undefined = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, entity.id);

            if(typeof harborRepository === 'undefined') {
                return res._failBadRequest({message: 'No Train exists in the terminated train repository.'})
            }

            let result = await resultRepository.findOne({train_id: harborRepository.name});

            let trainResult : undefined | TrainResult;

            if(typeof result === 'undefined') {
                // create result
                const dbData = resultRepository.create({
                    image: harborRepository.fullName,
                    train_id: harborRepository.name,
                    status: TrainResultStateOpen
                });

                await resultRepository.save(dbData);

                trainResult = dbData;

                entity.result = trainResult;
            } else {
                result = resultRepository.merge(result, {status: TrainResultStateOpen});

                await resultRepository.save(result);

                trainResult = result;
            }

            // send queue message
            await createResultServiceResultCommand('download', {
                projectName: harborRepository.projectName,
                repositoryName: harborRepository.name,
                repositoryFullName: harborRepository.fullName,

                trainId: harborRepository.name,
                resultId: trainResult.id
            });

            return res._respond({data: trainResult});
    }
}

export async function doTrainResultTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['reset'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(TrainResult);

    switch (validationData.task) {
        case "reset":
            let entity = await repository.findOne(id, {relations: ["train"]});

            if (typeof entity === 'undefined') {
                return res._failNotFound();
            }

            if (!isPermittedToOperateOnRealmResource(req.user, entity.train)) {
                return res._failForbidden();
            }

            await createResultServiceResultCommand('download', {
                projectName: HARBOR_OUTGOING_PROJECT_NAME,
                repositoryName: entity.train.id,
                repositoryFullName: HARBOR_OUTGOING_PROJECT_NAME + '/' + entity.train.id,

                trainId: entity.train.id,
                resultId: entity.id
            });

            entity.status = TrainResultStateOpen;

            await repository.save(entity);

            return res._respondAccepted({data: entity});
    }
}
