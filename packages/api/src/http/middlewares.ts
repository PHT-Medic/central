/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setupHTTPMiddleware } from '@authup/server-adapter';
import { createRequestJsonHandler, createRequestUrlEncodedHandler } from '@routup/body';
import { createRequestHandler as createRequestCookieHandler } from '@routup/cookie';
import { createRequestHandler as createRequestQueryHandler } from '@routup/query';
import cors from 'cors';
import { useClient } from 'redis-extension';
import type { Router } from 'routup';
import { useEnv, useLogger } from '../config';
import {
    registerPrometheusMiddleware,
    registerRateLimitMiddleware,
    registerSwaggerMiddleware,
    setupLicenseAgreementMiddleware,
} from './middleware';

export function registerMiddlewares(router: Router) {
    router.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    router.use(createRequestJsonHandler());
    router.use(createRequestUrlEncodedHandler({ extended: false }));
    router.use(createRequestCookieHandler());
    router.use(createRequestQueryHandler());

    registerRateLimitMiddleware(router);
    registerPrometheusMiddleware(router);

    registerSwaggerMiddleware(router);

    router.use(setupHTTPMiddleware({
        redis: useClient(),
        oauth2: useEnv('authApiUrl'),
        logger: useLogger(),
    }));

    if (useEnv('env') === 'development') {
        router.use(setupLicenseAgreementMiddleware());
    }
}
