/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient as useHTTPClient } from '@trapi/client';
import { Client, setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID, VaultAPI } from '@personalhealthtrain/ui-common';
import https from 'https';
import { ErrorCode } from '@typescript-auth/domains';
import { Environment } from './env';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redisDatabase: Client,
    redisPub: Client,
    redisSub: Client,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig({ connectionString: env.redisConnectionString });

    const redisDatabase = useRedisClient();
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setHTTPConfig({
        clazz: VaultAPI,
        driver: {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString: env.vaultConnectionString,
        },
    }, 'vault');

    setHTTPConfig({
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        async (err) => {
            const { config } = err;

            if (
                err.response &&
                (
                    err.response.status === 401 || // Unauthorized
                    err.response.status === 403 || // Forbidden
                    err.response?.data?.code === ErrorCode.CREDENTIALS_INVALID
                )
            ) {
                const response = await useHTTPClient<VaultAPI>('vault').keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

                if (response) {
                    useHTTPClient().setAuthorizationHeader({
                        type: 'Basic',
                        username: response.data.id,
                        password: response.data.secret,
                    });

                    return useHTTPClient().request(config);
                }
            }

            return Promise.reject(err);
        },
    );

    const aggregators : {start: () => void}[] = [
    ];

    const components : {start: () => void}[] = [
    ];

    return {
        redisDatabase,
        redisPub,
        redisSub,

        aggregators,
        components,
    };
}
