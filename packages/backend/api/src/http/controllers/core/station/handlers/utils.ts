/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Proposal, Station } from '@personalhealthtrain/central-common';
import { check, validationResult } from 'express-validator';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';

export async function runStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<Station>> {
    const nameChain = check('name')
        .isLength({ min: 5, max: 100 })
        .exists()
        .notEmpty();

    if (operation === 'update') {
        nameChain.optional();
    }

    await nameChain.run(req);

    // -------------------------------------------------------------

    const secureIdChain = check('secure_id')
        .isLength({ min: 1, max: 100 })
        .exists()
        .matches(/^[a-z0-9]*$/);

    if (operation === 'update') {
        secureIdChain.optional();
    }

    await secureIdChain.run(req);

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

    if (operation === 'create') {
        await check('realm_id')
            .exists()
            .isString()
            .notEmpty()
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
