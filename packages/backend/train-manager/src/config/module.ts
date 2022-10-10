/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient as useHTTPClient } from 'hapic';
import {
    HTTPClient,
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    createRefreshRobotTokenOnResponseErrorHandler,
} from '@personalhealthtrain/central-common';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { Client, setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { Client as VaultClient } from '@hapic/vault';
import { Robot } from '@authelion/common';
import { buildCommandRouterComponent } from '../components/command-router';
import { Environment } from '../env';
import { useLogger } from '../modules/log';

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
                } catch (e) {
                    useLogger()
                        .debug('Attempt to refresh api credentials failed.');

                    throw e;
                }

                throw new Error('API credentials not present in vault.');
            },
            httpClient: useHTTPClient(),
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
