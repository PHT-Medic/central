/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { setupAuthMiddleware } from '@typescript-auth/server';
import { AuthorizationHeader } from '@typescript-auth/core';
import { useLogger } from '../../modules/log';
import responseMiddleware from './middleware/response';

import { errorMiddleware } from './middleware/error';
import { ExpressAppInterface, ExpressRequest } from './type';
import { useRateLimiter } from './middleware/rate-limiter';
import { authenticateWithAuthorizationHeader, parseCookie } from './middleware/auth';

export function createExpressApp() : ExpressAppInterface {
    useLogger().debug('setup express app...', { service: 'express' });

    const expressApp : Express = express();

    expressApp.set('trust proxy', 1);

    expressApp.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    // Payload parser
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    // Rate Limiter
    expressApp.use(useRateLimiter);

    // Loading routes
    expressApp.use(responseMiddleware);

    expressApp.use(setupAuthMiddleware({
        parseCookie: (request: ExpressRequest) => parseCookie(request),
        authenticateWithAuthorizationHeader: (
            request: ExpressRequest,
            value: AuthorizationHeader,
        ) => authenticateWithAuthorizationHeader(request, value),
    }));

    expressApp.use(errorMiddleware);

    return expressApp;
}
