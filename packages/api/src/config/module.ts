/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HTTPClient } from '@authup/common';
import { mountHTTPInterceptorForRefreshingToken } from '@personalhealthtrain/central-server-common';
import { setConfig as setHTTPConfig } from 'hapic';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { setConfig as setRedisConfig } from 'redis-extension';
import { Client as VaultClient, setClient as setVaultClient } from '@hapic/vault';
import { detectProxyConnectionConfig } from '@personalhealthtrain/central-common';
import { buildAuthupAggregator, buildTrainManagerAggregator } from '../aggregators';
import { setAuthupClient, setMinioConfig } from '../core';
import { EnvironmentName, useEnv } from './env';

import { ApiKey } from './api';

import { buildRouterComponent } from '../components';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    const proxyConfig = detectProxyConnectionConfig();

    const vaultClient = new VaultClient({
        driver: {
            proxy: false,
        },
        extra: {
            connectionString: useEnv('vaultConnectionString'),
        },
    });
    setVaultClient(vaultClient);

    setHTTPConfig({
        driver: {
            baseURL: 'https://menzel.informatik.rwth-aachen.de:3005/centralservice/api/',
            ...(proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
        },
    }, ApiKey.AACHEN_CENTRAL_SERVICE);

    setHTTPConfig({
        driver: {
            baseURL: 'https://station-registry.hs-mittweida.de/api/',
            ...(proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
        },
    }, ApiKey.AACHEN_STATION_REGISTRY);

    // ---------------------------------------------

    const authupClient = new HTTPClient({
        driver: {
            baseURL: useEnv('authupApiUrl'),
        },
    });
    mountHTTPInterceptorForRefreshingToken(authupClient, {
        authApiUrl: useEnv('authupApiUrl'),
        vault: vaultClient,
    });
    setAuthupClient(authupClient);

    // ---------------------------------------------

    setRedisConfig({
        connectionString: useEnv('redisConnectionString'),
    });

    // ---------------------------------------------

    setAmqpConfig({
        connection: useEnv('rabbitMqConnectionString'),
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    // ---------------------------------------------

    setMinioConfig(useEnv('minioConnectionString'));

    // ---------------------------------------------

    const isTest = useEnv('env') === EnvironmentName.TEST;

    // ---------------------------------------------

    const aggregators : {start: () => void}[] = [];

    if (!isTest) {
        aggregators.push(buildAuthupAggregator());
        aggregators.push(buildTrainManagerAggregator());
    }

    // ---------------------------------------------

    const components : {start: () => void}[] = [];
    if (!isTest) {
        components.push(
            buildRouterComponent(),
        );
    }

    return {
        aggregators,
        components,
    };
}
