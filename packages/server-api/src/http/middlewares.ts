/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { basic } from '@routup/basic';
import type { Router } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import {
    registerAuthupMiddleware, registerCorsMiddleware,
    registerLicenseAgreementMiddleware,
    registerPrometheusMiddleware,
    registerRateLimiterMiddleware,
    registerSwaggerMiddleware,
} from './middleware';

export function registerMiddlewares(router: Router) {
    registerCorsMiddleware(router);
    router.use(basic());

    const isTestEnvironment = useEnv('env') === EnvironmentName.TEST;
    if (!isTestEnvironment) {
        registerRateLimiterMiddleware(router);
        registerPrometheusMiddleware(router);
        registerSwaggerMiddleware(router);
    }

    registerAuthupMiddleware(router);

    if (!isTestEnvironment) {
        registerLicenseAgreementMiddleware(router);
    }
}
