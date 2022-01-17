import { setTrapiClientConfig, useTrapiClient } from '@trapi/client';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID, VaultAPI } from '@personalhealthtrain/ui-common';
import { ErrorCode } from '@typescript-auth/domains';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { Client, setConfig as setRedisConfig, useClient } from 'redis-extension';
import https from 'https';
import { buildCommandRouterComponent } from './components/command-router';
import { Environment } from './env';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redisDatabase: Client,
    redisPub: Client,
    redisSub: Client,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

function createConfig({ env } : ConfigContext) : Config {
    setRedisConfig('default', { connectionString: env.redisConnectionString });

    const redisDatabase = useClient('default');
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setAmqpConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    setTrapiClientConfig('vault', {
        clazz: VaultAPI,
        connectionString: env.vaultConnectionString,
        driver: {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
    });

    setTrapiClientConfig('default', {
        driver: {
            baseURL: env.apiUrl,
            withCredentials: true,
        },
    });

    useTrapiClient('default').mountResponseInterceptor(
        (value) => value,
        async (err) => {
            const { config } = err;

            if (
                err.response &&
                (
                    err.response.status === 401 || // Unauthorized
                    err.response.status === 403 || // Forbidden
                    err.response?.data?.code === ErrorCode.CREDENTIALS_INVALID
                )
            ) {
                const robot = await useTrapiClient<VaultAPI>('vault').keyValue
                    .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

                if (robot) {
                    useTrapiClient('default').setAuthorizationHeader({
                        type: 'Basic',
                        username: robot.id,
                        password: robot.secret,
                    });

                    return useTrapiClient('default').request(config);
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
        redisDatabase,
        redisPub,
        redisSub,

        aggregators,
        components,
    };
}

export default createConfig;
