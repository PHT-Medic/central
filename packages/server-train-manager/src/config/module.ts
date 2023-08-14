/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ROBOT_SYSTEM_NAME, mountClientResponseErrorTokenHook } from '@authup/core';
import type { Aggregator, Component } from '@personalhealthtrain/server-core';
import { setClient as setHTTPClient } from 'hapic';
import {
    APIClient,
} from '@personalhealthtrain/core';
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

    const centralClient = new APIClient({
        baseURL: useEnv('apiUrl'),
    });
    mountClientResponseErrorTokenHook(centralClient, {
        baseURL: useEnv('authupApiUrl'),
        tokenCreator: {
            type: 'robotInVault',
            name: ROBOT_SYSTEM_NAME,
            vault: useEnv('vaultConnectionString'),
        },
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
