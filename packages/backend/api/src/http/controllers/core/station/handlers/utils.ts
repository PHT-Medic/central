/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem } from '@personalhealthtrain/central-common';
import { check, validationResult } from 'express-validator';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { extendExpressValidationResultWithRegistry } from '../../registry/utils/extend';
import { StationValidationResult } from '../type';

export async function runStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<StationValidationResult> {
    const result : StationValidationResult = {
        data: {},
        meta: {},
    };

    const nameChain = check('name')
        .isLength({ min: 5, max: 100 })
        .exists()
        .notEmpty();

    if (operation === 'update') {
        nameChain.optional();
    }

    await nameChain.run(req);

    // -------------------------------------------------------------

    await check('public_key')
        .isLength({ min: 5, max: 4096 })
        .exists()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('email')
        .isLength({ min: 5, max: 256 })
        .exists()
        .isEmail()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('hidden')
        .isBoolean()
        .optional()
        .run(req);

    // -------------------------------------------------------------

    await check('external_name')
        .isLength({ min: 1, max: 255 })
        .exists()
        .matches(/^[a-z0-9-_]*$/)
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('registry_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    if (operation === 'create') {
        await check('realm_id')
            .exists()
            .isString()
            .notEmpty()
            .run(req);

        await check('ecosystem')
            .exists()
            .isIn(Object.values(Ecosystem))
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });
    await extendExpressValidationResultWithRegistry(result);

    return result;
}
