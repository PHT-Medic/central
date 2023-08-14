/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createJsonHandler, createUrlEncodedHandler } from '@routup/body';
import { createHandler as createRequestCookieHandler } from '@routup/cookie';
import { createHandler as createRequestQueryHandler } from '@routup/query';
import cors from 'cors';
import type { Router } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import {
    registerAuthupMiddleware,
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

    router.use(createJsonHandler());
    router.use(createUrlEncodedHandler({ extended: false }));
    router.use(createRequestCookieHandler());
    router.use(createRequestQueryHandler());

    const isTestEnvironment = useEnv('env') === EnvironmentName.TEST;
    if (!isTestEnvironment) {
        registerRateLimitMiddleware(router);
        registerPrometheusMiddleware(router);

        registerSwaggerMiddleware(router);
    }

    registerAuthupMiddleware(router);

    if (!isTestEnvironment) {
        router.use(setupLicenseAgreementMiddleware());
    }
}
