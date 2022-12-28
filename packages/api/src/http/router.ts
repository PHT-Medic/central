/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import cors from 'cors';

import {
    registerControllers as registerAuthControllers,
    registerMiddlewares,
} from '@authup/server-http';
import promBundle from 'express-prom-bundle';
import { Router } from 'routup';

import { registerControllers } from './routes';

import {
    errorMiddleware,
    licenseAgreementMiddleware,
    rateLimitMiddleware,
} from './middleware';
import env from '../env';

export function createRouter() : Router {
    const router = new Router();

    router.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    registerMiddlewares(router);

    if (env.env === 'development') {
        router.use(licenseAgreementMiddleware);
    }

    if (env.env !== 'test') {
        // Rate Limiter
        router.use(rateLimitMiddleware);

        // Metrics
        const metricsMiddleware = promBundle({
            includeMethod: true,
            includePath: true,
        });

        router.use(metricsMiddleware);
    }

    registerControllers(router);
    registerAuthControllers(router);

    router.use(errorMiddleware);

    return router;
}
