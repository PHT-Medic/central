/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    APIType, ProxyConnectionConfig, detectProxyConnectionConfig,
    setAPIConfig,
} from '@personalhealthtrain/ui-common';
import { setConfig } from 'amqp-extension';
import https from 'https';
import { buildDispatcherComponent } from './components/event-dispatcher';
import { Environment } from './env';
import { buildTrainBuilderAggregator } from './aggregators/train-builder';
import { buildTrainResultAggregator } from './aggregators/train-result';
import { buildDispatcherAggregator } from './aggregators/dispatcher';
import { buildCommandRouterComponent } from './components/command-router';
import { buildTrainRouterAggregator } from './aggregators/train-router';

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

    setAPIConfig(APIType.HARBOR, {
        type: APIType.HARBOR,
        connectionString: env.harborConnectionString,
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
    });

    setAPIConfig(APIType.VAULT, {
        type: APIType.VAULT,
        connectionString: env.vaultConnectionString,
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
    });

    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    const aggregators : {start: () => void}[] = [
        buildDispatcherAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator(),
        buildTrainRouterAggregator(),
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
        buildDispatcherComponent(),
    ];

    return {
        aggregators,
        components,
    };
}
