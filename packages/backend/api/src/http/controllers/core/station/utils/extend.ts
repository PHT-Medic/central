/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';
import { Station } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { ExpressValidationResult, buildExpressValidationErrorMessage } from '../../../../express-validation';
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
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(StationEntity);
        const entity = await repository.findOneBy({ id: result.data.station_id });
        if (!entity) {
            throw new BadRequestError(buildExpressValidationErrorMessage('station_id'));
        }

        result.meta.station = entity;
    }

    return result;
}
