/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientError } from '@ebec/http';
import { isObject } from '@personalhealthtrain/core';
import type { Router } from 'routup';
import { errorHandler } from 'routup';
import { useLogger } from '../../config';

export function registerErrorHandler(router: Router) {
    router.use(errorHandler((error, req, res) => {
        // catch and decorate some db errors :)
        switch (error.code) {
            case 'ER_DUP_ENTRY':
            case 'SQLITE_CONSTRAINT_UNIQUE': {
                error.statusCode = 409;
                error.message = 'An entry with some unique attributes already exist.';
                error.expose = true;
                break;
            }
            case 'ER_DISK_FULL':
                error.statusCode = 507;
                error.message = 'No database operation possible, due the leak of free disk space.';
                error.expose = true;
                break;
        }

        if (error.logMessage) {
            useLogger().warn(error.message);
        }

        if (
            error.statusCode > 500 &&
            error.statusCode < 600
        ) {
            error.message = 'An internal server error occurred.';
        }

        res.statusCode = error.statusCode;

        return {
            statusCode: error.statusCode,
            code: `${error.code}`,
            message: error.message,
            ...(isObject(error.data) && isClientError(error) ? error.data : {}),
        };
    }));
}
