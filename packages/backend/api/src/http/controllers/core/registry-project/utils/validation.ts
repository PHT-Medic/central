/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { RegistryProjectType } from '@personalhealthtrain/central-common';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';
import { ExpressRequest } from '../../../../type';
import {
    ExpressValidationError,
    ExpressValidationResult, extendExpressValidationResultWithRelation,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../../express-validation';

export async function runRegistryProjectValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<ExpressValidationResult<RegistryProjectEntity>> {
    const result : ExpressValidationResult<RegistryProjectEntity> = initExpressValidationResult();

    const registryChain = check('registry_id')
        .exists()
        .isUUID();

    if (operation === 'update') {
        registryChain.optional();
    }

    await registryChain.run(req);

    // ----------------------------------------------

    const titleChain = check('name')
        .exists()
        .isLength({ min: 5, max: 128 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // -------------------------------------------------------------

    const externalNameChain = check('external_name')
        .isLength({ min: 1, max: 255 })
        .exists()
        .matches(/^[a-z0-9-_]*$/);

    if (operation === 'update') {
        externalNameChain.optional();
    }

    await externalNameChain.run(req);

    // -------------------------------------------------------------

    if (operation === 'create') {
        await check('type')
            .exists()
            .isIn(Object.values(RegistryProjectType))
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });
    await extendExpressValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    return result;
}
