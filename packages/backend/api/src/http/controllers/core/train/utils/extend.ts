/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { ExpressValidationResult } from '../../../../express-validation';
import { TrainEntity } from '../../../../../domains/core/train/entity';

type ExpressValidationResultExtendedWithTrain = ExpressValidationResult<{
    [key: string]: any,
    train_id: Train['id']
}, {
    [key: string]: any,
    train?: TrainEntity
}>;

export async function extendExpressValidationResultWithTrain<
    T extends ExpressValidationResultExtendedWithTrain,
    >(result: T) : Promise<T> {
    if (result.data.train_id) {
        const stationRepository = getRepository(TrainEntity);
        const station = await stationRepository.findOne(result.data.train_id);
        if (typeof station === 'undefined') {
            throw new NotFoundError('The referenced train is invalid.');
        }

        result.meta.train = station;
    }

    return result;
}
