import {getRepository} from "typeorm";
import {Train} from "../../../../../domains/pht/train";

import {check, matchedData, validationResult} from "express-validator";
import {isPermittedForResourceRealm} from "../../../../../domains/auth/realm/db/utils";
import {
    buildTrain,
    detectTrainBuildStatus,
    detectTrainRunStatus,
    generateTrainHash,
    startTrain,
    stopTrain, triggerTrainDownload
} from "../../../../../domains/pht/train/commands";

export enum TrainCommand {
    BUILD = 'build',
    DETECT_BUILD_STATUS = 'detectBuildStatus',
    DETECT_RUN_STATUS = 'detectRunStatus',
    GENERATE_HASH = 'generateHash',
    START = 'start',
    STOP = 'stop',
    TRIGGER_DOWNLOAD = 'triggerDownload'
}

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
        .isIn(['build', 'detectBuildStatus', 'generateHash', 'detectRunStatus', 'start', 'stop'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Train);

    let entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        return res._failForbidden();
    }

    try {
        switch (validationData.task as TrainCommand) {
            case TrainCommand.BUILD:
                entity = await buildTrain(entity);
                break;
            case TrainCommand.DETECT_BUILD_STATUS:
                entity = await detectTrainBuildStatus(entity);
                break;
            case TrainCommand.DETECT_RUN_STATUS:
                entity = await detectTrainRunStatus(entity);
                break;
            case TrainCommand.GENERATE_HASH:
                entity = await generateTrainHash(entity);
                break;
            case TrainCommand.START:
                entity = await startTrain(entity);
                break;
            case TrainCommand.STOP:
                entity = await stopTrain(entity);
                break;
            case TrainCommand.TRIGGER_DOWNLOAD:
                entity.result = await triggerTrainDownload(entity.id);
                break;
        }

        return res._respond(entity);
    } catch (e) {
        return res._failServerError({message: 'An unknown error occurred. The Task could not be executed...'})
    }
}

