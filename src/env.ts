import dotenv from "dotenv";
import {randomBytes} from "crypto";
import path from "path";

const envResult = dotenv.config({
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
    jwtPrivateKey: string | null,
    jwtPublicKey: string | null,
    jwtSecret: string | null,
    jwtProcedure: string,
    localAuthenticator: string | null,
    apiUrl: string,
    webAppUrl: string,
    trainBuilderSocketUrl: string,
    vaultApiUrl: string,
    rabbitMqConnectionString: string
}

const env : Environment = {
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),
    jwtPrivateKey: requireFromEnv('JWT_PRIVATE_KEY', null),
    jwtPublicKey: requireFromEnv('JWT_PUBLIC_KEY', null),
    jwtSecret: requireFromEnv('JWT_SECRET', randomBytes(10).toString('hex')),
    jwtProcedure: requireFromEnv('JWT_PROCEDURE', 'HMAC'),
    localAuthenticator: requireFromEnv('LOCAL_AUTHENTICATOR'),
    apiUrl: requireFromEnv('API_URL'),
    webAppUrl: requireFromEnv('WEB_APP_URL'),
    trainBuilderSocketUrl: requireFromEnv('TRAIN_BUILDER_SOCKET_URL'),
    vaultApiUrl: requireFromEnv('VAULT_API_URL'),
    rabbitMqConnectionString: requireFromEnv('RABBITMQ_CONNECTION_STRING')
};

export default env;
