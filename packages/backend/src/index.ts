/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

import { createConnection } from 'typeorm';
import { buildConnectionOptions } from 'typeorm-extension';
import env from './env';

import createConfig from './config';
import createExpressApp from './config/http/express';
import createHttpServer from './config/http/server';
import { useLogger } from './modules/log';

import { initDemo } from './demo';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig({ env });
    const expressApp = createExpressApp();
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

        initDemo();
    }

    const connectionOptions = await buildConnectionOptions();
    const connection = await createConnection(connectionOptions);
    if (env.env === 'development') {
        await connection.synchronize();
    }

    start();
})();
