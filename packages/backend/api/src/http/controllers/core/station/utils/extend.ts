/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { Station } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../../express-validation';
import { StationEntity } from '../../../../../domains/core/station/entity';

type ExpressValidationResultExtendedWithStation = ExpressValidationResult<{
    [key: string]: any,
    station_id: Station['id']
}, {
    [key: string]: any,
    station?: StationEntity
}>;

export async function extendExpressValidationResultWithStation<
    T extends ExpressValidationResultExtendedWithStation,
>(result: T) : Promise<T> {
    if (result.data.station_id) {
        const stationRepository = getRepository(StationEntity);
        const station = await stationRepository.findOne(result.data.station_id);
        if (typeof station === 'undefined') {
            throw new NotFoundError('The referenced station is invalid.');
        }

        result.meta.station = station;
    }

    return result;
}
