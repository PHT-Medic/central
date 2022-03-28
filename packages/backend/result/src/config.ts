/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient as useHTTPClient } from '@trapi/client';
import {
    HTTPClient,
    refreshAuthRobotTokenOnResponseError,
} from '@personalhealthtrain/central-common';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { Client, setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import https from 'https';
import { VaultClient } from '@trapi/vault-client';
import { buildCommandRouterComponent } from './components/command-router';
import { Environment } from './env';

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
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString: env.vaultConnectionString,
        },
    }, 'vault');

    setHTTPConfig({
        clazz: HTTPClient,
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        refreshAuthRobotTokenOnResponseError,
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
