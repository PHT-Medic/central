/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

import env from './env';

import { createConfig } from './config';
import { createHttpServer } from './config/http/server';
import { useLogger } from './config/log';
import { createSocketServer } from './config/socket/server';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig({ env });
    const httpServer = createHttpServer();
    const socketServer = createSocketServer({ httpServer, config, env });

    function signalStart() {
        useLogger().debug(`Startup on 127.0.0.1:${env.port} (${env.env}) completed.`, { service: 'system' });
    }

    /*
    Start Server
    */
    function start() {
        config.components.forEach((c) => c.start());
        config.aggregators.forEach((a) => a.start());

        socketServer.listen(env.port);
        signalStart();
    }

    start();
})();
