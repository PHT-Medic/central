import {config} from "dotenv";
import path from "path";

const envResult = config({
    path: path.resolve(__dirname, '../.env')
});

if (envResult.error) {
    console.error('[ERROR] env failed to load:' + envResult.error);
    process.exit(1)
}

export function requireFromEnv(key : string, alt?: string) {
    if (!process.env[key] && typeof alt === 'undefined') {
        console.error('[APP ERROR] Missing env variable:'+key)

        return process.exit(1)
    }

    return process.env[key] ?? alt;
}

export interface Environment {
    env: string,
    port: number,

    rabbitMqConnectionString: string,
    harborConnectionString: string,
    vaultConnectionString: string,
}

const env : Environment = {
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),

    rabbitMqConnectionString: requireFromEnv('RABBITMQ_CONNECTION_STRING'),
    harborConnectionString: requireFromEnv('HARBOR_CONNECTION_STRING'),
    vaultConnectionString: requireFromEnv('VAULT_CONNECTION_STRING'),
};

export default env;
