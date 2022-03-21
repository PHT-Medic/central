/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImage } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { BadRequestError } from '@typescript-error/http';
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
        const repository = getRepository(MasterImageEntity);
        const entity = await repository.findOne(result.data.master_image_id);
        if (typeof entity === 'undefined') {
            throw new BadRequestError(buildExpressValidationErrorMessage('master_image_id'));
        }

        result.meta.masterImage = entity;
    }

    return result;
}
