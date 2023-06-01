/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AbilityManager, CookieName, ROBOT_SYSTEM_NAME } from '@authup/core';
import { setInterval } from 'node:timers';
import type { OAuth2TokenGrantResponse } from '@authup/core';
import { createHTTPMiddleware } from '@authup/server-adapter';
import { useClient as useVaultClient } from '@hapic/vault';
import { parseAuthorizationHeader } from 'hapic';
import { useClient as useRedisClient } from 'redis-extension';
import { useRequestCookie } from 'routup';
import type { Router } from 'routup';
import { EnvironmentName, useEnv, useLogger } from '../../config';
import { useAuthupClient } from '../../core';
import { setRequestEnv, useRequestEnv } from '../request';

export function registerAuthupMiddleware(router: Router) {
    let cache : Record<string, string> = {};

    setInterval(() => {
        cache = {};
    }, 120 * 1000);

    router.use(async (req, res, next) => {
        if (!req.headers.authorization) {
            const cookie = useRequestCookie(req, CookieName.ACCESS_TOKEN);
            if (typeof cookie === 'string') {
                req.headers.authorization = `Bearer ${cookie}`;
            }
        }

        if (typeof req.headers.authorization !== 'string') {
            next();
            return;
        }

        const header = parseAuthorizationHeader(req.headers.authorization);
        if (!header) {
            next();
            return;
        }

        if (cache[req.headers.authorization]) {
            req.headers.authorization = `Bearer ${cache[req.headers.authorization]}`;
            next();
            return;
        }

        if (header.type === 'Basic') {
            const authupClient = useAuthupClient();

            useLogger().info(`Using basic auth type for: ${header.username}`);

            let token : OAuth2TokenGrantResponse;

            if (header.username === 'admin') {
                token = await authupClient.token.createWithPasswordGrant({
                    username: header.username,
                    password: header.password,
                });
            } else {
                token = await authupClient.token.createWithRobotCredentials({
                    id: header.username,
                    secret: header.password,
                });
            }

            cache[req.headers.authorization] = token.access_token;
            req.headers.authorization = `Bearer ${token.access_token}`;
        }

        next();
    });

    router.use(createHTTPMiddleware({
        tokenByCookie: (req, cookieName) => useRequestCookie(req, cookieName),
        tokenVerifier: {
            baseURL: useEnv('authupApiUrl'),
            creator: {
                type: 'robotInVault',
                name: ROBOT_SYSTEM_NAME,
                vault: useVaultClient(),
            },
            cache: {
                type: 'redis',
                client: useRedisClient(),
            },
        },
        tokenVerifierHandler: (req, data) => {
            const ability = new AbilityManager(data.permissions);
            setRequestEnv(req, 'ability', ability);

            setRequestEnv(req, 'realmId', data.realm_id);
            setRequestEnv(req, 'realmName', data.realm_name);
            setRequestEnv(req, 'realm', {
                id: data.realm_id,
                name: data.realm_name,
            });

            switch (data.sub_kind) {
                case 'user': {
                    setRequestEnv(req, 'userId', data.sub);
                    setRequestEnv(req, 'userName', data.sub_name);
                    break;
                }
                case 'robot': {
                    setRequestEnv(req, 'robotId', data.sub);
                    setRequestEnv(req, 'robotName', data.sub_name);
                    break;
                }
            }
        },
    }));

    // todo: permissions should be created and set for test suite :)
    if (useEnv('env') === EnvironmentName.TEST) {
        router.use(async (req, res, next) => {
            const ability = useRequestEnv(req, 'ability');
            ability.has = (_input: any) => true;

            next();
        });
    }
}
