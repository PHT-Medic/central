/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isTrainStationApprovalStatus } from '@personalhealthtrain/ui-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError } from '../../../../error/validation';
import { matchedValidationData } from '../../../../../modules/express-validator';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';

export async function runTrainStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<TrainStationEntity>> {
    if (operation === 'create') {
        await check('station_id')
            .exists()
            .isUUID()
            .run(req);

        await check('train_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('position')
        .exists()
        .isInt()
        .optional({ nullable: true })
        .run(req);

    if (operation === 'update') {
        await check('approval_status')
            .optional({ nullable: true })
            .custom((value) => isTrainStationApprovalStatus(value))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
