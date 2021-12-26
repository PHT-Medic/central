/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIType, setAPIConfig } from '@personalhealthtrain/ui-common';
import { setConfig } from 'amqp-extension';
import { Redis, setRedisConfig, useRedisInstance } from 'redis-extension';
import { Environment } from './env';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redisDatabase: Redis,
    redisPub: Redis,
    redisSub: Redis,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig('default', { connectionString: env.redisConnectionString });

    const redisDatabase = useRedisInstance('default');
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    setAPIConfig(APIType.DEFAULT, {
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

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
