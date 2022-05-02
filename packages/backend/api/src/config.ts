/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig } from '@trapi/client';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { setConfig as setRedisConfig } from 'redis-extension';
import { VaultClient } from '@trapi/vault-client';
import { HTTPClientKey, detectProxyConnectionConfig } from '@personalhealthtrain/central-common';
import { Environment } from './env';
import { buildTrainManagerAggregator } from './aggregators/train-manager';
import { buildRobotAggregator } from './aggregators/robot';

import { ApiKey } from './config/api';

import { buildCommandRouterComponent } from './components/command-router';
import { buildEventRouterComponent } from './components/event-router';

interface ConfigContext {
    env: Environment
}

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig({ env } : ConfigContext) : Config {
    const proxyConfig = detectProxyConnectionConfig();

    setHTTPConfig({
        clazz: VaultClient,
        driver: {
            ...(proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
        },
        extra: {
            connectionString: env.vaultConnectionString,
        },
    }, HTTPClientKey.VAULT);

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

    setRedisConfig({ connectionString: env.redisConnectionString });

    // ---------------------------------------------

    setAmqpConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    const aggregators : {start: () => void}[] = [
        buildRobotAggregator(),

        buildTrainManagerAggregator(),
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
        buildEventRouterComponent(),
    ];

    return {
        aggregators,
        components,
    };
}
