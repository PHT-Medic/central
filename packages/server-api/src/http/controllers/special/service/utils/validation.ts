/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryAPICommand } from '@personalhealthtrain/core';
import { check, validationResult } from 'express-validator';
import type { Request } from 'routup';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError,
    initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';

type ValidationResult = {
    id: string,
    command: `${RegistryAPICommand}`,
    secret?: string
};

export async function runServiceRegistryValidation(
    req: Request,
) : Promise<RequestValidationResult<ValidationResult>> {
    const result : RequestValidationResult<ValidationResult> = initRequestValidationResult();

    await check('id')
        .exists()
        .notEmpty()
        .isUUID()
        .run(req);

    await check('command')
        .exists()
        .isString()
        .custom((value) => Object.values(RegistryAPICommand).includes(value))
        .run(req);

    await check('secret')
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    return result;
}
