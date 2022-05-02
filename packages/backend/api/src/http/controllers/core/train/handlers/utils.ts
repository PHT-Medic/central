/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem, TrainType } from '@personalhealthtrain/central-common';
import { check, validationResult } from 'express-validator';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { extendExpressValidationResultWithMasterImage } from '../../master-image/utils/extend';
import { TrainValidationResult } from '../type';
import { extendExpressValidationResultWithProposal } from '../../proposal/utils/extend';
import { extendExpressValidationResultWithRegistry } from '../../registry/utils/extend';

export async function runTrainValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<TrainValidationResult> {
    const result : TrainValidationResult = {
        data: {},
        meta: {},
    };

    if (operation === 'create') {
        await check('proposal_id')
            .exists()
            .notEmpty()
            .isUUID()
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
            const dataSource = await useDataSource();
            const repository = dataSource.getRepository(TrainFileEntity);
            const entity = await repository.findOneBy({ id: value });
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
        .exists()
        .notEmpty()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    await check('registry_id')
        .exists()
        .notEmpty()
        .isUUID()
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

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithMasterImage(result);
    await extendExpressValidationResultWithProposal(result);
    await extendExpressValidationResultWithRegistry(result);

    if (result.meta.proposal) {
        if (!isPermittedForResourceRealm(req.realmId, result.meta.proposal.realm_id)) {
            throw new BadRequestError('The referenced proposal realm is not permitted.');
        }
    }

    if (result.meta.registry) {
        if (!isPermittedForResourceRealm(req.realmId, result.meta.registry.realm_id)) {
            throw new BadRequestError('The referenced registry realm is not permitted.');
        }

        if (result.meta.registry.ecosystem !== Ecosystem.DEFAULT) {
            throw new BadRequestError('The registry must be part of the default ecosystem.');
        }
    }

    return result;
}
