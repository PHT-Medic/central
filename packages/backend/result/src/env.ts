/*
 * Copyright (c) 2022.
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
    process.exit(1);
}

export function requireFromEnv(key : string, alt?: string) {
    if (!process.env[key] && typeof alt === 'undefined') {
        // eslint-disable-next-line no-console
        console.error(`[APP ERROR] Missing env variable:${key}`);

        return process.exit(1);
    }

    return process.env[key] ?? alt;
}

export interface Environment {
    env: string,
    port: number,

    redisConnectionString: string,
    rabbitMqConnectionString: string,
    harborConnectionString: string,
    vaultConnectionString: string,

    aachenHarborConnectionString: string,
    aachenHarborProjectName: string,

    apiUrl: string
}

const env : Environment = {
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),

    redisConnectionString: requireFromEnv('REDIS_CONNECTION_STRING'),
    rabbitMqConnectionString: requireFromEnv('RABBITMQ_CONNECTION_STRING'),
    harborConnectionString: requireFromEnv('HARBOR_CONNECTION_STRING'),
    vaultConnectionString: requireFromEnv('VAULT_CONNECTION_STRING'),

    aachenHarborConnectionString: requireFromEnv('AACHEN_HARBOR_CONNECTION_STRING', null),
    aachenHarborProjectName: requireFromEnv('AACHEN_HARBOR_PROJECT', null),

    apiUrl: requireFromEnv('API_URL'),
};

export default env;
