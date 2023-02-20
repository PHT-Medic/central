/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { config } from 'dotenv';
import path from 'node:path';
import type { EnvironmentName } from './constants';
import type { Environment } from './type';
import { requireBooleanFromEnv, requireFromEnv, requireIntegerFromEnv } from './utils';

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
        env: requireFromEnv('NODE_ENV', 'development') as `${EnvironmentName}`,
        port: requireIntegerFromEnv('PORT', 3002),

        jwtMaxAge: requireIntegerFromEnv('JWT_MAX_AGE', 3600),

        minioConnectionString: requireFromEnv('MINIO_CONNECTION_STRING', 'http://admin:start123@127.0.0.1:9000'),
        redisConnectionString: requireFromEnv('REDIS_CONNECTION_STRING', 'redis://127.0.0.1'),
        rabbitMqConnectionString: requireFromEnv('RABBITMQ_CONNECTION_STRING', 'amqp://root:start123@127.0.0.1'),
        vaultConnectionString: requireFromEnv('VAULT_CONNECTION_STRING', 'start123@http://127.0.0.1:8090/v1/'),

        apiUrl: requireFromEnv('API_URL', 'http://127.0.0.1:3002/'),
        appUrl: requireFromEnv('APP_URL', 'http://127.0.0.1:3000/'),

        skipProposalApprovalOperation: requireBooleanFromEnv('SKIP_PROPOSAL_APPROVAL_OPERATION', false),
        skipTrainApprovalOperation: requireBooleanFromEnv('SKIP_TRAIN_APPROVAL_OPERATION', false),

        httpProxyAPIs: requireFromEnv('HTTP_PROXY_APIS', null),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
