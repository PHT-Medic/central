/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import {
    SecretType,
    UserSecret,
} from '@personalhealthtrain/central-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';

export async function runUserSecretValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<UserSecret>> {
    const keyChain = check('key')
        .isLength({ min: 3, max: 128 });

    if (operation === 'update') {
        keyChain.optional();
    }

    await keyChain.run(req);

    // ----------------------------------------------

    const contentChain = check('content')
        .isLength({ min: 3, max: 8192 });

    if (operation === 'update') {
        contentChain.optional();
    }

    await contentChain.run(req);

    // ----------------------------------------------

    const typeChain = check('type')
        .optional({ nullable: true })
        .isIn(Object.values(SecretType));

    if (operation === 'update') {
        typeChain.optional();
    }

    await typeChain.run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
