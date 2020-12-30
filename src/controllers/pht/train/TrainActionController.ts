import {getRepository} from "typeorm";
import {Train} from "../../../domains/pht/train";
import {isPermittedToOperateOnRealmResource} from "../../../services/auth/utils";
import {PhtMainQueue, publishQueueMessage, QueueMessage} from "../../../services/message-queue/message";
import {createTrainBuilderQueueMessage} from "../../../services/pht/configurator";
import {
    TrainConfiguratorStateFinished,
    TrainConfiguratorStateHashGenerated,
    TrainStateBuilding, TrainStateStarted,
    TrainStateStarting
} from "../../../domains/pht/train/states";
import * as crypto from "crypto";
import {getTrainFileFilePath} from "../../../services/pht/file";
import * as fs from "fs";
import {check, matchedData, validationResult} from "express-validator";
import {useHarborApi} from "../../../services/api/provider/harbor";
import {getPhtHarborLabelNextId} from "../../../config/pht";

export async function generateTrainHashActionRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {relations: ['files']});

    const hash = crypto.createHash('sha512');
    hash.update(Buffer.from(entity.user_id.toString(), 'utf-8'));

    for(let i=0; i<entity.files.length; i++) {
        const filePath = getTrainFileFilePath(entity.files[i]);

        const fileContent = fs.readFileSync(filePath);

        hash.update(fileContent);
    }

    const sessionId : Buffer = crypto.randomBytes(64);
    hash.update(sessionId);

    if(entity.query && entity.query !== '') {
        hash.update(entity.query);
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

export async function doTrainTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['start', 'stop'])
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
        case "start":
            if(entity.status === TrainStateStarted) {
                return res._failBadRequest({message: 'The train has already been started...'});
            }

            try {
                await useHarborApi().post('projects/pht_incoming/repositories/'+entity.id+'/artifacts/latest/labels',{
                    id: getPhtHarborLabelNextId()
                });
            } catch (e) {
                return res._failServerError({message: 'Train could not be started...'})
            }

            entity = repository.merge(entity, {
                status: TrainStateStarted
            });

            await repository.save(entity);

            return res._respond({data: entity});
        case "stop":
            return res._failBadRequest({message: 'A train canno\'t be stopped yet.'})
    }
}

export async function doTrainBuilderTaskRouteHandler(req: any, res: any) {
    let {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['build'])
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

    let message: QueueMessage = await createTrainBuilderQueueMessage(entity);
    message.metadata.token = req.token;

    switch (validationData.task) {
        case 'build':
            if (!req.ability.can('start', 'trainExecution')) {
                return res._failForbidden();
            }

            try {
                message.type = 'trainBuild';

                entity = repository.merge(entity, {
                    configurator_status: TrainConfiguratorStateFinished,
                    status: TrainStateBuilding
                });

                await publishQueueMessage('tb', message);

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
    }
}
