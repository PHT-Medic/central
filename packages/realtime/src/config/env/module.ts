/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { readFromProcessEnv, readIntFromProcessEnv } from '@personalhealthtrain/central-server-common';
import { hasOwnProperty } from '@personalhealthtrain/central-common';
import { config } from 'dotenv';
import path from 'node:path';
import type { EnvironmentName } from './constants';
import type { Environment } from './type';

config({
    debug: false,
    path: path.resolve(__dirname, '..', '..', '..', '.env'),
});

let instance : Environment | undefined;

export function useEnv() : Environment;
export function useEnv<K extends keyof Environment>(key: K) : Environment[K];
export function useEnv(key?: string) : any {
    if (typeof instance !== 'undefined') {
        if (typeof key === 'string') {
            return instance[key];
        }

        return instance;
    }

    instance = {
        env: readFromProcessEnv('NODE_ENV', 'development') as `${EnvironmentName}`,
        port: readIntFromProcessEnv('PORT', 3001),
        redisConnectionString: readFromProcessEnv('REDIS_CONNECTION_STRING', null),
        vaultConnectionString: readFromProcessEnv('VAULT_CONNECTION_STRING', 'start123@http://127.0.0.1:8090/v1/'),

        authupApiUrl: readFromProcessEnv('AUTHUP_API_URL', 'http://127.0.0.1:3010/'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}

export function isSetEnv(key: keyof Environment) : boolean {
    const env = useEnv();

    return hasOwnProperty(env, key) && typeof env[key] !== 'undefined' && env[key] !== null;
}
