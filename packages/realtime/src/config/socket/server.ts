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
import { useRateLimiter } from '../http/middleware/rate-limiter';
import { errorMiddleware } from '../http/middleware/error';
import { socketAuthMiddleware } from './middleware/auth';
import { registerSocketHandlers } from './handlers';
import { Environment } from '../../env';
import { Config } from '../../config';

interface SocketServerContext {
    httpServer: HTTPServer,
    env: Environment,
    config: Config
}

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

export function createSocketServer(context : SocketServerContext) : Server {
    useLogger().debug('setup socket server...', { service: 'socket' });

    const server = new Server(context.httpServer, {
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

    // limit incoming traffic (req p. sec)
    server.use(wrap(useRateLimiter));

    // receive user
    server.use(socketAuthMiddleware);

    // register handlers
    registerSocketHandlers(server);

    // handle errors
    server.use(wrap(errorMiddleware));

    return server;
}
