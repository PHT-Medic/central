/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { body, check, validationResult } from 'express-validator';
import { Ecosystem, getHostNameFromString } from '@personalhealthtrain/central-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { RegistryValidationResult } from '../type';

export async function runRegistryValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<RegistryValidationResult> {
    const result : RegistryValidationResult = {
        data: {},
        meta: {},
    };

    const titleChain = check('name')
        .exists()
        .isLength({ min: 5, max: 128 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    const hostChain = body('host')
        .exists()
        .isString()
        .isLength({ min: 5, max: 512 });

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
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    await check('account_secret')
        .exists()
        .isLength({ min: 5, max: 256 })
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
