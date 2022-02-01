/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainType } from '@personalhealthtrain/ui-common';
import { check, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, ExpressValidatorMeta } from '../../../../error/validation';
import { matchedValidationData } from '../../../../../modules/express-validator';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { MasterImageEntity } from '../../../../../domains/core/master-image/entity';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';

export async function runTrainValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<Train>> {
    if (operation === 'create') {
        await check('proposal_id')
            .exists()
            .isUUID()
            .custom(async (value, meta: ExpressValidatorMeta) => {
                const repository = getRepository(ProposalEntity);
                const entity = await repository.findOne(value);
                if (!entity) {
                    throw new NotFoundError('The referenced proposal is invalid.');
                }

                if (!isPermittedForResourceRealm(meta.req.realmId, entity.realm_id)) {
                    throw new NotFoundError('The referenced proposal is not permitted.');
                }
            })
            .run(req);

        await check('type')
            .exists()
            .isString()
            .custom((value) => Object.values(TrainType).includes(value))
            .run(req);
    }

    await check('user_rsa_secret_id')
        .notEmpty()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    await check('user_paillier_secret_id')
        .notEmpty()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    await check('name')
        .notEmpty()
        .isLength({ min: 1, max: 128 })
        .optional({ nullable: true })
        .run(req);

    await check('entrypoint_file_id')
        .isUUID()
        .custom(async (value) => {
            const repository = getRepository(TrainFileEntity);
            const entity = await repository.findOne(value);
            if (!entity) {
                throw new NotFoundError('The referenced entrypoint file is invalid.');
            }
        })
        .optional({ nullable: true })
        .run(req);

    await check('hash_signed')
        .notEmpty()
        .isLength({ min: 10, max: 8096 })
        .optional({ nullable: true })
        .run(req);

    await check('master_image_id')
        .isUUID()
        .custom(async (value) => {
            const repository = getRepository(MasterImageEntity);
            const entity = await repository.findOne(value);
            if (!entity) {
                throw new Error('The referenced master image is invalid.');
            }
        })
        .optional({ nullable: true })
        .run(req);

    await check('query')
        .isString()
        .isLength({ min: 1, max: 4096 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
