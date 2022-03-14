/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI, ProxyConnectionConfig, VaultAPI, detectProxyConnectionConfig,
} from '@personalhealthtrain/central-common';
import { setConfig as setHTTPConfig } from '@trapi/client';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import https from 'https';
import { setConfig as setRedisConfig } from 'redis-extension';
import { Environment } from './env';
import { buildTrainBuilderAggregator } from './aggregators/train-builder';
import { buildTrainResultAggregator } from './aggregators/train-extractor';
import { buildRegistryAggregator } from './aggregators/registry';
import { buildRobotAggregator } from './aggregators/robot';
import { buildTrainRouterAggregator } from './aggregators/train-router';

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
    let proxyAPis : string[] = [];
    if (env.httpProxyAPIs) {
        proxyAPis = env.httpProxyAPIs.split(',').map((api) => api.toLowerCase());
    }

    const proxyConfig : ProxyConnectionConfig | undefined = detectProxyConnectionConfig();

    setHTTPConfig({
        clazz: HarborAPI,
        driver: {
            ...(proxyAPis.includes('harbor') && proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString: env.harborConnectionString,
        },
    }, ApiKey.HARBOR);

    setHTTPConfig({
        clazz: VaultAPI,
        driver: {
            ...(proxyAPis.includes('vault') && proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString: env.vaultConnectionString,
        },
    }, ApiKey.VAULT);

    setHTTPConfig({
        driver: {
            baseURL: 'https://menzel.informatik.rwth-aachen.de:3005/centralservice/api/',
        },
    }, ApiKey.AACHEN_CENTRAL_SERVICE);

    setHTTPConfig({
        driver: {
            baseURL: 'https://station-registry.hs-mittweida.de/api/',
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

        buildRegistryAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator(),
        buildTrainRouterAggregator(),
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
