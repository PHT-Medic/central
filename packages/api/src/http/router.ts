/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import cors from 'cors';

import {
    setupHTTPMiddleware
} from '@authup/server-adapter';
import { Router } from 'routup';
import {useLogger} from '../config';

import { registerControllers } from './routes';

import {
    errorMiddleware,
    licenseAgreementMiddleware,
} from './middleware';
import { useEnv } from '../config';

export function createRouter() : Router {
    const router = new Router();

    router.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    router.use(setupHTTPMiddleware({
        redis: false, // todo: inherit from config
        oauth2: useEnv('authApiUrl'),
        logger: useLogger(),
    }));

    if (useEnv('env') === 'development') {
        router.use(licenseAgreementMiddleware);
    }

    registerControllers(router);

    router.use(errorMiddleware);

    return router;
}
