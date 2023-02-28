/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient as useHTTPClient } from 'hapic';
import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import {
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    createRefreshRobotTokenOnResponseErrorHandler,
} from '@personalhealthtrain/central-common';
import { Client as VaultClient } from '@hapic/vault';
import type { Robot } from '@authup/common';
import { useLogger } from '../core';
import { useEnv } from './env';
import type { Config } from './type';

export function createConfig() : Config {
    setRedisConfig({ connectionString: useEnv('redisConnectionString') });

    const redisDatabase = useRedisClient();
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setHTTPConfig({
        clazz: VaultClient,
        driver: {
            proxy: false,
        },
        extra: {
            connectionString: useEnv('vaultConnectionString'),
        },
    }, HTTPClientKey.VAULT);

    setHTTPConfig({
        driver: {
            baseURL: useEnv('apiUrl'),
            proxy: false,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        createRefreshRobotTokenOnResponseErrorHandler({
            async load() {
                useLogger()
                    .debug('Attempt to refresh api credentials...');

                try {
                    const response = await useHTTPClient<VaultClient>(HTTPClientKey.VAULT).keyValue
                        .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

                    if (
                        response &&
                        response.data
                    ) {
                        return response.data as Robot;
                    }

                    useLogger()
                        .debug('Payload to refresh api credentials could not be read', {
                            response,
                        });
                } catch (e) {
                    useLogger()
                        .debug('Attempt to refresh api credentials failed.', {
                            error: e,
                        });

                    throw e;
                }

                throw new Error('API credentials not present in vault.');
            },
            httpClient: useHTTPClient(),
        }),
    );

    return {
        redisDatabase,
        redisPub,
        redisSub,
    };
}
