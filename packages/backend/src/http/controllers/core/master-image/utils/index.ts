/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { getRepository } from 'typeorm';
import { MasterImageEntity } from '../../../../../domains/core/master-image/entity';

export function createRequestMasterImageIdValidation() {
    return check('master_image_id')
        .isUUID()
        .custom(async (value) => {
            const repository = getRepository(MasterImageEntity);
            const entity = await repository.findOne(value);
            if (!entity) {
                throw new Error('The referenced master image is invalid.');
            }
        });
}
