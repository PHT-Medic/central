/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, { Express } from 'express';
import cors from 'cors';

import path from 'path';
import { registerControllers as registerAuthControllers, registerMiddlewares } from '@typescript-auth/server';
import promBundle from 'express-prom-bundle';
import { Client } from 'redis-extension';

import { registerControllers } from './routes';

import { errorMiddleware } from './middleware/error';
import { useRateLimiter } from './middleware/rate-limiter';
import env from '../env';
import { getWritableDirPath } from '../config/paths';
import { ExpressAppInterface } from './type';

export function createExpressApp(redis?: Client | boolean | string) : ExpressAppInterface {
    const expressApp : Express = express();

    expressApp.set('trust proxy', 1);

    expressApp.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    registerMiddlewares(expressApp, {
        bodyParserMiddleware: true,
        cookieParserMiddleware: true,
        responseMiddleware: true,
        swaggerMiddleware: false,

        writableDirectoryPath: path.join(process.cwd(), 'writable'),
        redis,
    });

    if (env.env !== 'test') {
        // Rate Limiter
        expressApp.use(useRateLimiter);

        // Metrics
        const metricsMiddleware = promBundle({
            includeMethod: true,
            includePath: true,
        });

        expressApp.use(metricsMiddleware);
    }

    registerControllers(expressApp);
    registerAuthControllers(expressApp, {
        tokenMaxAge: env.jwtMaxAge,
        selfUrl: env.apiUrl,
        selfAuthorizeRedirectUrl: env.webAppUrl,
        writableDirectoryPath: getWritableDirPath(),
        redis,
    });

    expressApp.use(errorMiddleware);

    return expressApp;
}
