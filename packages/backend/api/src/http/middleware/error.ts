/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Next, Request, Response, send,
} from 'routup';
import { hasOwnProperty } from 'typeorm-extension';
import {
    ConflictError,
    InsufficientStorageError,
    InternalServerError,
    InternalServerErrorOptions,
    extendsBaseError,
} from '@ebec/http';
import { useLogger } from '../../config';

export function errorMiddleware(
    error: Error,
    request: Request,
    response: Response,
    next: Next,
) {
    const code : string | undefined = hasOwnProperty(error, 'code') && typeof error.code === 'string' ?
        error.code :
        undefined;

    // catch and decorate some mysql errors :)
    switch (code) {
        case 'ER_DUP_ENTRY':
        case 'SQLITE_CONSTRAINT_UNIQUE':
            error = new ConflictError('An entry with some unique attributes already exist.', { previous: error });
            break;
        case 'ER_DISK_FULL':
            error = new InsufficientStorageError('No database operation possible, due the leak of free disk space.', { previous: error });
            break;
    }

    const baseError = extendsBaseError(error) ?
        error :
        new InternalServerError(error, { decorateMessage: true });

    const statusCode : number = baseError.getOption('statusCode') ?? InternalServerErrorOptions.statusCode;

    if (baseError.getOption('logMessage')) {
        const isInspected = extendsBaseError(error);
        useLogger().log({ level: 'error', message: `${!isInspected ? error.message : (baseError.message || baseError)}` });
    }

    if (baseError.getOption('decorateMessage')) {
        baseError.message = 'An error occurred.';
    }

    response.statusCode = statusCode;

    const extra = baseError.getOption('extra');

    send(response, {
        code: baseError.getOption('code') ?? InternalServerErrorOptions.code,
        message: baseError.message ?? InternalServerErrorOptions.message,
        statusCode,
        ...(extra ? { extra } : {}),
    });
}
