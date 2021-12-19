/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { Train, TrainCommand, isPermittedForResourceRealm } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import {
    detectTrainBuildStatus,
    detectTrainRunStatus,
    generateTrainHash,
    startBuildTrain,
    startTrain,
    stopBuildTrain,
    stopTrain,
    triggerTrainResultStart, triggerTrainResultStatus, triggerTrainResultStop,
} from '../../../../domains/core/train/commands';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

/**
 * Execute a train command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function handleTrainCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new NotFoundError();
    }

    await check('command')
        .exists()
        .custom((command) => Object.values(TrainCommand).includes(command))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: true });

    const repository = getRepository(Train);

    let entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

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

    return res.respond({ data: entity });
}
