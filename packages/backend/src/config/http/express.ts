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
import { useLogger } from '../../modules/log';

import { registerControllers } from './routes';

import { errorMiddleware } from './middleware/error';
import { useRateLimiter } from './middleware/rate-limiter';
import env from '../../env';
import { getWritableDirPath } from '../paths';

export interface ExpressAppInterface extends Express{

}

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

    registerMiddlewares(expressApp, {
        bodyParser: true,
        cookieParser: true,
        response: true,
        auth: {
            writableDirectoryPath: path.join(process.cwd(), 'writable'),
        },
        swaggerDocumentation: false,
    });

    // Rate Limiter
    expressApp.use(useRateLimiter);

    const metricsMiddleware = promBundle({
        includeMethod: true,
        includePath: true,
    });

    expressApp.use(metricsMiddleware);

    registerControllers(expressApp);
    registerAuthControllers(expressApp, {
        controller: {
            token: {
                maxAge: env.jwtMaxAge,
            },
            oauth2Provider: {
                redirectUrl: env.webAppUrl,
            },
        },
        selfUrl: env.apiUrl,
        writableDirectoryPath: getWritableDirPath(),
    });

    expressApp.use(errorMiddleware);

    return expressApp;
}
