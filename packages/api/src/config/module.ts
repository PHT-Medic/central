/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient, ROBOT_SYSTEM_NAME, mountClientResponseErrorTokenHook } from '@authup/core';
import { Client, setClient } from 'hapic';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { setConfig as setRedisConfig } from 'redis-extension';
import { VaultClient, setClient as setVaultClient } from '@hapic/vault';
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
    const vaultClient = new VaultClient({
        connectionString: useEnv('vaultConnectionString'),
    });
    setVaultClient(vaultClient);

    const aachenService = new Client({
        baseURL: 'https://menzel.informatik.rwth-aachen.de:3005/centralservice/api/',
    });
    setClient(aachenService, ApiKey.AACHEN_CENTRAL_SERVICE);

    const stationRegistry = new Client({
        baseURL: 'https://station-registry.hs-mittweida.de/api/',
    });
    setClient(stationRegistry, ApiKey.AACHEN_STATION_REGISTRY);

    // ---------------------------------------------

    const authupClient = new APIClient({
        baseURL: useEnv('authupApiUrl'),
    });
    mountClientResponseErrorTokenHook(authupClient, {
        baseURL: useEnv('authupApiUrl'),
        tokenCreator: {
            type: 'robotInVault',
            name: ROBOT_SYSTEM_NAME,
            vault: vaultClient,
        },
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
