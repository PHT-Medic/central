/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';
import { Meta, Result, ValidationError } from 'express-validator';
import { ExpressRequest } from '../type';

export type ExpressValidatorMeta = Meta & {
    req: ExpressRequest
};

export function buildExpressValidationErrorMessage<
    T extends Record<string, any> = Record<string, any>,
>(names: (keyof T)[]) {
    if (names.length > 1) {
        return `The parameters ${names.join(', ')} is invalid.`;
    }
    return `The parameter ${names[0]} is invalid.`;
}

export class ExpressValidationError extends BadRequestError {
    constructor(validation: Result<ValidationError>) {
        let errors : ValidationError[] = validation.array();
        errors = [...new Map(errors.map((item) => [item.param, item])).values()]
            .sort((a, b) => a.param.localeCompare(b.param));

        let message: string;

        if (errors) {
            const parameterNames = errors.map((error) => error.param);

            message = buildExpressValidationErrorMessage(parameterNames);
        } else {
            message = 'An unknown validation error occurred.';
        }

        super({
            message,
            extra: errors,
        });
    }
}
