/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { useEnv } from './env';
import type { Config } from './type';

export function createConfig() : Config {
    setRedisConfig({ connectionString: useEnv('redisConnectionString') });

    const redisDatabase = useRedisClient();
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    return {
        redisDatabase,
        redisPub,
        redisSub,
    };
}
