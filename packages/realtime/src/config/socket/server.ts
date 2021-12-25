/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { useLogger } from '../../modules/log';
import { useAuthMiddleware } from './middleware/auth';
import { registerSocketHandlers } from './handlers';
import { Environment } from '../../env';
import { Config } from '../../config';
import { SocketServerInterface } from './type';

interface SocketServerContext {
    httpServer: HTTPServer,
    env: Environment,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    useLogger().debug('setup socket server...', { service: 'socket' });

    const server : SocketServerInterface = new Server(context.httpServer, {
        adapter: createAdapter(context.config.redisPub, context.config.redisSub),
        cors: {
            origin(origin, callback) {
                callback(null, true);
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        // ...
    });

    // receive user
    server.use(useAuthMiddleware(context.config));

    // register handlers
    registerSocketHandlers(server);

    return server;
}
