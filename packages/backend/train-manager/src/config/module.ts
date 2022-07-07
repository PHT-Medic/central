/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient, useClient as useHTTPClient } from '@trapi/client';
import {
    HTTPClient,
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    createRefreshRobotTokenOnResponseErrorHandler,
    shouldRefreshRobotTokenResponseError,
} from '@personalhealthtrain/central-common';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { Client, setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { VaultClient } from '@trapi/vault-client';
import { Robot } from '@authelion/common';
import { useLogger } from '@personalhealthtrain/central-realtime/src/config/log';
import { buildCommandRouterComponent } from '../components/command-router';
import { Environment } from '../env';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redis: Client,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig({ connectionString: env.redisConnectionString });

    const redis = useRedisClient();

    setAmqpConfig({
        connection: env.rabbitMqConnectionString,
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
            connectionString: env.vaultConnectionString,
        },
    }, HTTPClientKey.VAULT);

    setHTTPConfig({
        clazz: HTTPClient,
        retry: {
            retryCondition: (err) => shouldRefreshRobotTokenResponseError(err),
            retryDelay: (retryCount) => 5000 * retryCount,
        },
        driver: {
            proxy: false,
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        createRefreshRobotTokenOnResponseErrorHandler({
            async load() {
                useLogger()
                    .debug('Attempt to refresh api authentication & authorization');

                return useClient<VaultClient>(HTTPClientKey.VAULT).keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM)
                    .then((response) => response.data as Robot);
            },
            httpClient: useClient(),
        }),
    );

    const aggregators : {start: () => void}[] = [
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
    ];

    return {
        redis,

        aggregators,
        components,
    };
}

export default createConfig;
