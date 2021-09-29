import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {isPermittedForResourceRealm, Train} from "@personalhealthtrain/ui-common";
import {TrainCommand} from "@personalhealthtrain/ui-common";
import {
    detectTrainBuildStatus,
    detectTrainRunStatus,
    generateTrainHash,
    startBuildTrain,
    startTrain,
    stopBuildTrain,
    stopTrain,
    triggerTrainResultStart, triggerTrainResultStatus, triggerTrainResultStop
} from "../../../../../domains/pht/train/commands";

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

    await check('command')
        .exists()
        .custom(command => {
            return Object.values(TrainCommand).includes(command);
        })
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
        switch (validationData.command as TrainCommand) {
            // Build Commands
            case TrainCommand.BUILD_STATUS:
                entity = await detectTrainBuildStatus(entity);
                break;
            case TrainCommand.BUILD_START:
                entity = await startBuildTrain(entity);
                break;
            case TrainCommand.BUILD_STOP:
                entity = await stopBuildTrain(entity);
                break;


            // Run Commands
            case TrainCommand.RUN_STATUS:
                entity = await detectTrainRunStatus(entity);
                break;
            case TrainCommand.RUN_START:
                entity = await startTrain(entity);
                break;
            case TrainCommand.RUN_STOP:
                entity = await stopTrain(entity);
                break;

            // Result Service
            case TrainCommand.RESULT_STATUS:
                entity = await triggerTrainResultStatus(entity.id);
                break;
            case TrainCommand.RESULT_START:
                entity = await triggerTrainResultStart(entity.id);
                break;
            case TrainCommand.RESULT_STOP:
                entity = await triggerTrainResultStop(entity.id);
                break;

            // General Commands
            case TrainCommand.GENERATE_HASH:
                entity = await generateTrainHash(entity);
                break;
        }

        return res._respond({data: entity});
    } catch (e) {
        console.log(e);
        return res._failServerError({message: 'An unknown error occurred. The Task could not be executed...'})
    }
}

