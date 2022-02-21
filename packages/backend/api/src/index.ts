/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

import { createConnection } from 'typeorm';
import { buildTokenAggregator } from '@typescript-auth/server';
import { useClient } from 'redis-extension';
import env from './env';

import { createConfig } from './config';
import { createExpressApp } from './http/express';
import { createHttpServer } from './http/server';
import { useLogger } from './config/log';
import { buildDatabaseConnectionOptions } from './database/utils';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig({ env });
    const redis = useClient();
    const expressApp = createExpressApp(redis);
    const httpServer = createHttpServer({ expressApp });

    function signalStart() {
        useLogger().debug(`Startup on 127.0.0.1:${env.port} (${env.env}) completed.`, { service: 'system' });
    }

    /*
    Start Server
    */
    function start() {
        config.components.forEach((c) => c.start());
        config.aggregators.forEach((a) => a.start());

        httpServer.listen(env.port, '0.0.0.0', signalStart);
    }

    const connectionOptions = await buildDatabaseConnectionOptions();
    const connection = await createConnection(connectionOptions);
    if (env.env === 'development') {
        await connection.synchronize();
    }

    const { start: startTokenAggregator } = buildTokenAggregator(redis);
    await startTokenAggregator();

    start();
})();
