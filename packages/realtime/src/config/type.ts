/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { Environment } from '../env';

export interface ConfigContext {
    env: Environment
}

export type Config = {
    redisDatabase: Client,
    redisPub: Client,
    redisSub: Client,

    aggregators: { start: () => void }[]
    components: { start: () => void }[]
};
