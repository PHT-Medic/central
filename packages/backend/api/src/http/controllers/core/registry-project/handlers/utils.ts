/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { RegistryProjectValidationResult } from '../type';
import { extendExpressValidationResultWithRegistry } from '../../registry/utils/extend';

export async function runRegistryProjectValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<RegistryProjectValidationResult> {
    const result : RegistryProjectValidationResult = {
        data: {},
        meta: {},
    };

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

    await check('ecosystem_aggregator')
        .exists()
        .isBoolean()
        .optional()
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });
    await extendExpressValidationResultWithRegistry(result);

    return result;
}
