/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { Ecosystem } from '@personalhealthtrain/central-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { extendExpressValidationResultWithMasterImage } from '../../master-image/utils/extend';
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

    const addressChain = check('address')
        .exists()
        .isURL()
        .isLength({ min: 5, max: 512 });

    if (operation === 'update') {
        addressChain.optional();
    }

    await addressChain.run(req);

    // ----------------------------------------------

    const ecosystemChain = check('ecosystem')
        .exists()
        .isIn(Object.values(Ecosystem));

    if (operation === 'update') {
        ecosystemChain.optional();
    }

    await ecosystemChain.run(req);

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

    return result;
}
