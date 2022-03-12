/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check } from 'express-validator';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressValidatorMeta } from '../../../../express-validation';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';

export function createRequestProposalIdValidation() {
    return check('proposal_id')
        .exists()
        .isUUID()
        .custom(async (value, meta: ExpressValidatorMeta) => {
            const repository = getRepository(ProposalEntity);
            const entity = await repository.findOne(value);
            if (!entity) {
                throw new NotFoundError('The referenced proposal is invalid.');
            }

            if (!isPermittedForResourceRealm(meta.req.realmId, entity.realm_id)) {
                throw new NotFoundError('The referenced proposal realm is not permitted.');
            }
        });
}
