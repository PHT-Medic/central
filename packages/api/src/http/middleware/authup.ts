/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { OAuth2TokenGrantResponse } from '@authup/common';
import { setupHTTPMiddleware } from '@authup/server-adapter';
import { parseAuthorizationHeader } from 'hapic';
import { useClient } from 'redis-extension';
import type { Router } from 'routup';
import { EnvironmentName, useEnv, useLogger } from '../../config';
import { useAuthupClient } from '../../core';
import { useRequestEnv } from '../request';

export function registerAuthupMiddleware(router: Router) {
    let cache : Record<string, string> = {};

    router.use(async (req, res, next) => {
        const header = parseAuthorizationHeader(req.headers.authorization);
        if (!header) {
            next();
        }

        if (Math.random() * 100 < 5) {
            cache = {};
        }

        if (cache[req.headers.authorization]) {
            req.headers.authorization = `Bearer ${cache[req.headers.authorization]}`;
            next();
            return;
        }

        if (header.type === 'Basic') {
            const authupClient = useAuthupClient();
            let token : OAuth2TokenGrantResponse;

            if (header.username === 'admin') {
                token = await authupClient.oauth2.token.createWithPasswordGrant({
                    username: header.username,
                    password: header.password,
                });
            } else {
                token = await authupClient.oauth2.token.createWithRobotCredentials({
                    id: header.username,
                    secret: header.password,
                });
            }

            cache[req.headers.authorization] = token.access_token;
            req.headers.authorization = `Bearer ${token.access_token}`;
        }

        next();
    });

    router.use(setupHTTPMiddleware({
        redis: useClient(),
        oauth2: useEnv('authupApiUrl'),
        logger: useLogger(),
    }));

    // todo: permissions should be created and set for test suite :)
    if (useEnv('env') === EnvironmentName.TEST) {
        router.use(async (req, res, next) => {
            const ability = useRequestEnv(req, 'ability');
            ability.has = (input: any) => true;

            next();
        });
    }
}
