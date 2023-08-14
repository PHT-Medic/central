/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from './core';
import { createConfig, useEnv } from './config';
import { createHttpServer } from './http';
import { createSocketServer } from './socket';

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig();
    const httpServer = createHttpServer();
    const socketServer = createSocketServer({ httpServer, config });

    function signalStart() {
        useLogger().info(`Listening on 0.0.0.0:${useEnv('port')}`);
    }

    /*
    Start Server
    */
    function start() {
        socketServer.listen(useEnv('port'));
        signalStart();
    }

    start();
})();
