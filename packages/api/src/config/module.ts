/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setLogger as setAuthLogger } from '@authup/server-common';
import { setConfigOptions as setDatabaseConfigOptions } from '@authup/server-database';
import { runOAuth2Cleaner, setConfigOptions as setHTTPConfigOptions } from '@authup/server-http';
import { setConfig as setHTTPConfig } from 'hapic';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import path from 'path';
import { setConfig as setRedisConfig } from 'redis-extension';
import { Client as VaultClient } from '@hapic/vault';
import {
    HTTPClientKey,
    PermissionKey, detectProxyConnectionConfig,
} from '@personalhealthtrain/central-common';
import { setMinioConfig } from '../core/minio';
import { useEnv } from './env';
import { buildTrainManagerAggregator } from '../aggregators/train-manager';
import { buildRobotAggregator } from '../aggregators/robot';

import { ApiKey } from './api';

import { buildCommandRouterComponent } from '../components/command-router';
import { buildEventRouterComponent } from '../components/event-router';
import { useLogger } from './log';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    const proxyConfig = detectProxyConnectionConfig();

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

    setDatabaseConfigOptions({
        env: useEnv('env'),
        rootPath: process.cwd(),
        writableDirectoryPath: path.join(__dirname, '..', '..', 'writable'),

        permissions: Object.values(PermissionKey),
        adminUsername: 'admin',
        adminPassword: 'start123',
        robotEnabled: true,
    });

    setHTTPConfigOptions({
        env: useEnv('env'),
        rootPath: process.cwd(),
        writableDirectoryPath: path.join(__dirname, '..', '..', 'writable'),

        publicUrl: useEnv('apiUrl'),
        authorizeRedirectUrl: useEnv('appUrl'),
        tokenMaxAgeAccessToken: useEnv('jwtMaxAge'),
        tokenMaxAgeRefreshToken: useEnv('jwtMaxAge'),
    });

    if (useEnv('env') !== 'test') {
        setAuthLogger(useLogger());
    }

    // ---------------------------------------------

    const aggregators : {start: () => void}[] = [
        {
            start: async () => {
                await runOAuth2Cleaner();
            },
        },

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
