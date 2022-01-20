/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setTrapiClientConfig, useTrapiClient } from '@trapi/client';
import { Client, setConfig as setRedisConfig, useClient } from 'redis-extension';
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
    setRedisConfig('default', { connectionString: env.redisConnectionString });

    const redisDatabase = useClient('default');
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setTrapiClientConfig('vault', {
        clazz: VaultAPI,
        connectionString: env.vaultConnectionString,
        driver: {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
    });

    setTrapiClientConfig('default', {
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useTrapiClient('default').mountResponseInterceptor(
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
                const response = await useTrapiClient<VaultAPI>('vault').keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

                if (response) {
                    useTrapiClient('default').setAuthorizationHeader({
                        type: 'Basic',
                        username: response.data.id,
                        password: response.data.secret,
                    });

                    return useTrapiClient('default').request(config);
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
