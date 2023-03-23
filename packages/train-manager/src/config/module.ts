/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@personalhealthtrain/central-server-common';
import {
    mountHTTPInterceptorForRefreshingToken,
} from '@personalhealthtrain/central-server-common';
import { Client as VaultClient } from '@hapic/vault';
import { setClient as setHTTPClient } from 'hapic';
import {
    HTTPClient,
} from '@personalhealthtrain/central-common';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import type { Client } from 'redis-extension';
import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { buildComponentRouter } from '../components';
import { setMinioConfig } from '../core';
import { isSetEnv, useEnv } from './env';

export type Config = {
    redis: Client,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    if (isSetEnv('redisConnectionString')) {
        setRedisConfig({ connectionString: useEnv('redisConnectionString') });
    }

    setMinioConfig(useEnv('minioConnectionString'));

    const redis = useRedisClient();

    setAmqpConfig({
        connection: useEnv('rabbitMqConnectionString'),
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    const centralClient = new HTTPClient({
        driver: {
            proxy: false,
            baseURL: useEnv('apiUrl'),
            withCredentials: true,
        },
    });
    mountHTTPInterceptorForRefreshingToken(centralClient, {
        authApiUrl: useEnv('authApiUrl'),
        vault: new VaultClient({
            driver: {
                proxy: false,
            },
            extra: {
                connectionString: useEnv('vaultConnectionString'),
            },
        }),
    });
    setHTTPClient(centralClient);

    const aggregators : Aggregator[] = [
    ];

    const components : Component[] = [
        buildComponentRouter(),
    ];

    return {
        redis,

        aggregators,
        components,
    };
}

export default createConfig;
