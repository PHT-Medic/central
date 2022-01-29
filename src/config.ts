import { setConfig as setHTTPConfig, useClient as useHTTPClient } from '@trapi/client';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID, VaultAPI } from '@personalhealthtrain/ui-common';
import { ErrorCode, OAuth2TokenGrant, TokenAPI } from '@typescript-auth/domains';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { Client, setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import https from 'https';
import { buildCommandRouterComponent } from './components/command-router';
import { Environment } from './env';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redis: Client,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig({ connectionString: env.redisConnectionString });

    const redis = useRedisClient();

    setAmqpConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    setHTTPConfig({
        clazz: VaultAPI,
        driver: {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
        extra: {
            connectionString: env.vaultConnectionString,
        },
    }, 'vault');

    setHTTPConfig({
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useHTTPClient().mountResponseInterceptor(
        (value) => value,
        async (err) => {
            const { config } = err;

            if (
                err.response &&
                (
                    err.response.status === 401 || // Unauthorized
                    err.response.status === 403 || // Forbidden
                    err.response?.data?.code === ErrorCode.TOKEN_EXPIRED
                )
            ) {
                const response = await useHTTPClient<VaultAPI>('vault').keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

                if (response) {
                    const tokenApi = new TokenAPI(useHTTPClient().driver);

                    const token = await tokenApi.create({
                        id: response.data.id,
                        secret: response.data.secret,
                        grant_type: OAuth2TokenGrant.ROBOT_CREDENTIALS,
                    });

                    useHTTPClient().setAuthorizationHeader({
                        type: 'Bearer',
                        token: token.access_token,
                    });

                    return useHTTPClient().request(config);
                }
            }

            return Promise.reject(err);
        },
    );

    const aggregators : {start: () => void}[] = [
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
    ];

    return {
        redis,

        aggregators,
        components,
    };
}

export default createConfig;
