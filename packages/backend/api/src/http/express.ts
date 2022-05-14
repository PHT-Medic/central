/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, { Express } from 'express';
import cors from 'cors';

import { registerControllers as registerAuthControllers, registerMiddlewares } from '@authelion/api-core';
import promBundle from 'express-prom-bundle';

import { registerControllers } from './routes';

import { errorMiddleware } from './middleware/error';
import { useRateLimiter } from './middleware/rate-limiter';
import env from '../env';
import { ExpressAppInterface } from './type';
import { checkLicenseAgreementAccepted } from './middleware/license-agreement';

export function createExpressApp() : ExpressAppInterface {
    const expressApp : Express = express();

    expressApp.set('trust proxy', 1);
    expressApp.set('x-powered-by', false);

    expressApp.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    registerMiddlewares(expressApp);

    if (env.env === 'development') {
        expressApp.use(checkLicenseAgreementAccepted);
    }

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
    registerAuthControllers(expressApp);

    expressApp.use(errorMiddleware);

    return expressApp;
}
