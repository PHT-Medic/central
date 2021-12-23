/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Redis } from 'ioredis';
import { setConfig } from 'amqp-extension';
import { Environment } from './env';
import { createRedisClient } from './config/redis';

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
    const redisDatabase = createRedisClient({ connectionString: env.redisConnectionString });
    const redisPub = createRedisClient({ connectionString: env.redisConnectionString });
    const redisSub = createRedisClient({ connectionString: env.redisConnectionString });

    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
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
