/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ExpressValidatorMeta } from '../../../../error/validation';
import { StationEntity } from '../../../../../domains/core/station/entity';

export function createRequestStationIdValidation(options: {permittedForRealm?: boolean}) {
    options ??= {};
    options.permittedForRealm = options.permittedForRealm ?? true;

    return check('station_id')
        .exists()
        .isUUID()
        .custom(async (value, meta: ExpressValidatorMeta) => {
            const repository = getRepository(StationEntity);
            const entity = await repository.findOne(value);
            if (!entity) {
                throw new NotFoundError('The referenced station is invalid.');
            }

            if (
                options.permittedForRealm &&
                !isPermittedForResourceRealm(meta.req.realmId, entity.realm_id)
            ) {
                throw new NotFoundError('The referenced station realm is not permitted.');
            }
        });
}
