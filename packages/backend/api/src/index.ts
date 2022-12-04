/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

import { DataSource } from 'typeorm';

import { setDataSource, setDataSourceOptions } from 'typeorm-extension';
import env from './env';
import { createConfig } from './config/module';
import { createRouter } from './http/router.js';
import { createHttpServer } from './http/server';
import { useLogger } from './config/log';
import { buildDataSourceOptions } from './database/utils';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig({ env });
    const router = createRouter();
    const httpServer = createHttpServer({ router });

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

    const dataSourceOptions = await buildDataSourceOptions();
    await setDataSourceOptions(dataSourceOptions);

    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    setDataSource(dataSource);

    start();
})();
