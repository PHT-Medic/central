/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { config } from 'dotenv';
import path from 'path';

const envResult = config({
    path: path.resolve(__dirname, '../.env'),
});

if (envResult.error) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] env failed to load:${envResult.error}`);
}

export function requireFromEnv(key : string, alt?: any) {
    if (!process.env[key] && typeof alt === 'undefined') {
        // eslint-disable-next-line no-console
        console.error(`[APP ERROR] Missing env variable:${key}`);

        return process.exit(1);
    }

    return process.env[key] ?? alt;
}

export interface Environment {
    env: 'development' | 'test' | 'production',
    port: number,
    swaggerDocumentation: boolean | null

    jwtMaxAge: number,

    redisConnectionString: string,
    rabbitMqConnectionString: string,
    harborConnectionString: string,
    vaultConnectionString: string,

    apiUrl: string,
    internalApiUrl: string,
    webAppUrl: string,

    demo: boolean,

    skipProposalApprovalOperation: boolean,
    skipTrainApprovalOperation: boolean,

    userPasswordImmutable: boolean,
    userSecretsImmutable: boolean,

    httpProxyAPIs: string | undefined
}

// tslint:disable-next-line:radix
const jwtMaxAge : number = parseInt(requireFromEnv('JWT_MAX_AGE', '3600'), 10);

const env : Environment = {
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),
    swaggerDocumentation: requireFromEnv('SWAGGER_DOCUMENTATION', 'false') !== 'false',

    jwtMaxAge: Number.isNaN(jwtMaxAge) ? 3600 : jwtMaxAge,

    redisConnectionString: requireFromEnv('REDIS_CONNECTION_STRING'),
    rabbitMqConnectionString: requireFromEnv('RABBITMQ_CONNECTION_STRING'),
    harborConnectionString: requireFromEnv('HARBOR_CONNECTION_STRING'),
    vaultConnectionString: requireFromEnv('VAULT_CONNECTION_STRING'),

    apiUrl: requireFromEnv('API_URL'),
    internalApiUrl: requireFromEnv('INTERNAL_API_URL', requireFromEnv('API_URL')),
    webAppUrl: requireFromEnv('WEB_APP_URL'),

    demo: requireFromEnv('DEMO', 'false').toLowerCase() !== 'false',

    skipProposalApprovalOperation: requireFromEnv('SKIP_PROPOSAL_APPROVAL_OPERATION', 'false').toLowerCase() !== 'false',
    skipTrainApprovalOperation: requireFromEnv('SKIP_TRAIN_APPROVAL_OPERATION', 'false').toLowerCase() !== 'false',

    userPasswordImmutable: requireFromEnv('USER_PASSWORD_IMMUTABLE', 'false').toLowerCase() !== 'false',
    userSecretsImmutable: requireFromEnv('USER_SECRETS_IMMUTABLE', 'false').toLowerCase() !== 'false',
    httpProxyAPIs: requireFromEnv('HTTP_PROXY_APIS', null),
};

export default env;
