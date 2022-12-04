/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { body, check, validationResult } from 'express-validator';
import { Ecosystem, getHostNameFromString } from '@personalhealthtrain/central-common';
import { Request } from 'routup';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';
import {
    ExpressValidationError, ExpressValidationResult,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../../express-validation';

export async function runRegistryValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<ExpressValidationResult<RegistryEntity>> {
    const result : ExpressValidationResult<RegistryEntity> = initExpressValidationResult();

    const titleChain = check('name')
        .exists()
        .isLength({ min: 3, max: 128 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    const hostChain = body('host')
        .exists()
        .isString()
        .isLength({ min: 3, max: 512 });

    if (operation === 'update') {
        hostChain.optional();
    }

    await hostChain.run(req);

    // ----------------------------------------------

    if (operation === 'create') {
        await check('ecosystem')
            .exists()
            .isIn(Object.values(Ecosystem))
            .run(req);
    }

    // ----------------------------------------------

    await check('account_name')
        .exists()
        .isLength({ min: 3, max: 256 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    await check('account_secret')
        .exists()
        .isLength({ min: 3, max: 256 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    if (result.data.host) {
        result.data.host = getHostNameFromString(result.data.host);
    }

    return result;
}
