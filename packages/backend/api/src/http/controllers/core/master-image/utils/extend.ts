/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImage } from '@personalhealthtrain/central-common';
import { BadRequestError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { ExpressValidationResult, buildExpressValidationErrorMessage } from '../../../../express-validation';
import { MasterImageEntity } from '../../../../../domains/core/master-image/entity';

type ExpressValidationResultExtendedWithTrain = ExpressValidationResult<{
    [key: string]: any,
    master_image_id: MasterImage['id']
}, {
    [key: string]: any,
    masterImage?: MasterImageEntity
}>;

export async function extendExpressValidationResultWithMasterImage<
    T extends ExpressValidationResultExtendedWithTrain,
    >(result: T) : Promise<T> {
    if (result.data.master_image_id) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(MasterImageEntity);
        const entity = await repository.findOneBy({ id: result.data.master_image_id });
        if (!entity) {
            throw new BadRequestError(buildExpressValidationErrorMessage('master_image_id'));
        }

        result.meta.masterImage = entity;
    }

    return result;
}
