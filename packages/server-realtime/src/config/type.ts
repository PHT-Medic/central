/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';

export type Config = {
    redisDatabase: Client,
    redisPub: Client,
    redisSub: Client
};
