import {getRepository, Not} from "typeorm";
import {Train} from "../../../../domains/pht/train";
import {createTrainBuilderQueueMessage, publishTrainBuilderQueueMessage} from "../../../../domains/service/train-builder/queue";
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
} from "../../../../domains/service/train-router/queue";
import {TrainResult} from "../../../../domains/pht/train/result";
import {createResultServiceResultCommand} from "../../../../domains/service/result-service/queue";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../config/services/harbor";
import {TrainResultStateFinished, TrainResultStateOpen} from "../../../../domains/pht/train/result/states";
import {findHarborProjectRepository, HarborRepository} from "../../../../domains/service/harbor/project/repository/api";
import env from "../../../../env";
import {TrainStation} from "../../../../domains/pht/train/station";
import {TrainStationStateApproved} from "../../../../domains/pht/train/station/states";
import {isPermittedForResourceRealm} from "../../../../domains/auth/realm/db/utils";

/**
 * Execute a train command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function doTrainTaskRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['start', 'stop', 'build', 'scanHarbor', 'generateHash'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {relations: ['train_stations', 'master_image', 'entrypoint_file', 'files']});

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        return res._failForbidden();
    }

    try {

        switch (validationData.task) {
            case "build":
                if (entity.status === TrainStateStarted || entity.status === TrainStateFinished) {
                    return res._failBadRequest({message: 'The train can no longer be build...'});
                } else {
                    if(!env.demo) {
                        const trainStationRepository = getRepository(TrainStation);
                        const trainStations = await trainStationRepository.find({
                            train_id: entity.id,
                            status: Not(TrainStationStateApproved)
                        });

                        if (trainStations.length > 0) {
                            return res._failBadRequest({message: 'Not all stations have approved your train yet.'})
                        }

                        const queueMessage = await createTrainBuilderQueueMessage(entity, 'trainBuild');

                        await publishTrainBuilderQueueMessage(queueMessage);
                    }

                    entity = repository.merge(entity, {
                        configurator_status: TrainConfiguratorStateFinished,
                        status: env.demo ? TrainStateFinished : TrainStateBuilding
                    });

                    await repository.save(entity);

                    if(env.demo) {
                        const trainResultRepository = getRepository(TrainResult);
                        // tslint:disable-next-line:no-shadowed-variable
                        const trainResult = trainResultRepository.create({
                            download_id: 'DEMO',
                            train_id: entity.id,
                            status: TrainResultStateFinished
                        });

                        await trainResultRepository.save(trainResult);
                        entity.result = trainResult;
                    }

                    return res._respond({data: entity});
                }
            case "start":
                if (entity.status === TrainStateStarted || entity.status === TrainStateFinished) {
                    return res._failBadRequest({message: 'The train has already been started...'});
                } else {
                    const queueMessage = await createTrainRouterQueueMessageCommand(entity.id, MQ_TR_COMMAND_START_TRAIN);

                    await publishTrainRouterQueueMessage(queueMessage);

                    entity = repository.merge(entity, {
                        status: TrainStateStarting
                    });

                    await repository.save(entity);

                    return res._respond({data: entity});
                }
            case "stop":
                if (entity.status === TrainStateFinished) {
                    return res._failBadRequest({message: 'The train has already been terminated...'});
                } else {
                    const queueMessage = await createTrainRouterQueueMessageCommand(entity.id, MQ_TR_COMMAND_STOP_TRAIN);

                    await publishTrainRouterQueueMessage(queueMessage);

                    entity = repository.merge(entity, {
                        status: TrainStateStopping
                    });

                    await repository.save(entity);

                    return res._respond({data: entity});
                }
            case "scanHarbor":
                const resultRepository = getRepository(TrainResult);

                const harborRepository: HarborRepository | undefined = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, entity.id);

                if (typeof harborRepository === 'undefined') {
                    return res._failBadRequest({message: 'No Train exists in the terminated train repository.'})
                }

                let result = await resultRepository.findOne({train_id: harborRepository.name});

                let trainResult: undefined | TrainResult;

                if (typeof result === 'undefined') {
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
            case 'generateHash':
                const hash = crypto.createHash('sha512');
                // User Hash
                hash.update(Buffer.from(entity.user_id.toString(), 'utf-8'));

                console.log('Hashing: UserId: ' + entity.user_id);

                for (let i = 0; i < entity.files.length; i++) {
                    const filePath = getTrainFileFilePath(entity.files[i]);

                    const fileContent = fs.readFileSync(filePath);

                    console.log('Hashing: File: ', entity.files[i].name, Buffer.from(fileContent).toString('utf-8').length);

                    // File Hash
                    hash.update(fileContent);
                }

                // Session Id hash
                const sessionId: Buffer = crypto.randomBytes(64);
                console.log('Hashing: SessionId:', entity.session_id);
                hash.update(sessionId);

                const query: Buffer | undefined = !!entity.query && entity.query !== '' ?
                    Buffer.from(entity.query, 'utf-8') :
                    undefined;

                if (typeof query !== 'undefined') {
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
    } catch (e) {
        return res._failServerError({message: 'An unknown error occurred. The Task could not be executed...'})
    }
}

