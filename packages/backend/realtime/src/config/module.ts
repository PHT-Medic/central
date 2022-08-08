/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setHTTPConfig, useClient as useHTTPClient } from 'hapic';
import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import {
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    createRefreshRobotTokenOnResponseErrorHandler,
    shouldRefreshRobotTokenResponseError,
} from '@personalhealthtrain/central-common';
import { Client as VaultClient } from '@hapic/vault';
import { Robot } from '@authelion/common';
import { BadRequestError } from '@typescript-error/http';
import { useLogger } from './log';
import { Config, ConfigContext } from './type';

export function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig({ connectionString: env.redisConnectionString });

    const redisDatabase = useRedisClient();
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

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
        retry: {
            retryCondition: (err) => shouldRefreshRobotTokenResponseError(err),
            retryDelay: (retryCount) => 5000 * retryCount,
        },
        driver: {
            baseURL: env.apiUrl,
            proxy: false,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        createRefreshRobotTokenOnResponseErrorHandler({
            async load() {
                useLogger()
                    .debug('Attempt to refresh api authentication & authorization');

                return useHTTPClient<VaultClient>(HTTPClientKey.VAULT).keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM)
                    .then((response) => {
                        if (!response) {
                            throw new BadRequestError('No api credentials available...');
                        }

                        return response.data as Robot;
                    });
            },
            httpClient: useHTTPClient(),
        }),
    );

    const aggregators : {start: () => void}[] = [
    ];

    const components : {start: () => void}[] = [
    ];

    return {
        redisDatabase,
        redisPub,
        redisSub,

        aggregators,
        components,
    };
}
