/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import IORedis from 'ioredis';

interface RedisClientContext {
    connectionString: string
}

export interface RedisClientInterface extends IORedis.Redis {

}

export function createRedisClient({ connectionString } : RedisClientContext) : RedisClientInterface {
    const client = new IORedis(connectionString, {
        enableReadyCheck: true,
        retryStrategy(times: number): number | void | null {
            if (times === 3) {
                return undefined;
            }

            return Math.min(times * 50, 2000);
        },
        reconnectOnError(error: Error): boolean | 1 | 2 {
            if (error.message.includes('ECONNRESET')) {
                console.log('Redis, reconnect');
                return true;
            }

            console.log('Redis, dont reconnet', error);
            return false;
        },
    });

    client.on('error', (error: any) => {
        console.log('Redis crashed...');
        process.exit(0);
    });

    return client;
}
