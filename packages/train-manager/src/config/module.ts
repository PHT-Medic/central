/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@personalhealthtrain/central-server-common';
import { setConfig as setHTTPConfig, useClient as useHTTPClient } from 'hapic';
import {
    HTTPClient,
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    createRefreshRobotTokenOnResponseErrorHandler,
} from '@personalhealthtrain/central-common';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import type { Client } from 'redis-extension';
import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { Client as VaultClient } from '@hapic/vault';
import type { Robot } from '@authup/common';
import { buildComponentRouter } from '../components';
import { setMinioConfig, useLogger } from '../core';
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
        clazz: HTTPClient,
        driver: {
            proxy: false,
            baseURL: useEnv('apiUrl'),
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
