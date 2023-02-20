/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ForbiddenError, UnauthorizedError } from '@ebec/http';
import { REALM_MASTER_NAME } from '@authup/common';
import { setupSocketMiddleware } from '@authup/server-adapter';
import { useLogger } from '../log';
import { registerSocketHandlers, registerSocketNamespaceHandlers } from './handlers';
import type { Environment } from '../../env';
import env from '../../env';
import type { SocketInterface, SocketServerInterface } from './type';
import type { Config } from '../type';

interface SocketServerContext {
    httpServer: HTTPServer,
    env: Environment,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    useLogger().debug('setup socket server...', { service: 'socket' });

    const server : SocketServerInterface = new Server(context.httpServer, {
        adapter: createAdapter(context.config.redisPub, context.config.redisSub) as any,
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
    server.use(setupSocketMiddleware({
        redis: context.config.redisDatabase,
        oauth2: env.apiUrl, // todo: check if all realms supported
        logger: useLogger(),
    }));

    server.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            next(new UnauthorizedError());
            return;
        }

        if (socket.data.realmName !== REALM_MASTER_NAME) {
            next(new ForbiddenError());
        }
    });

    // register handlers
    registerSocketHandlers(server);

    // build & register realm workspaces
    const realmWorkspaces = server.of(/^\/realm#[a-z0-9A-Z-_]+$/);
    realmWorkspaces.use(setupSocketMiddleware({
        redis: context.config.redisDatabase,
        oauth2: env.apiUrl, // todo: check if all realms supported
    }));

    realmWorkspaces.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/realm#([a-z0-9A-Z-_]+)$/);

        if (matches[1] === socket.data.realmId || socket.data.realmName === REALM_MASTER_NAME) {
            next();
        } else {
            next(new ForbiddenError());
        }
    });

    registerSocketNamespaceHandlers(realmWorkspaces);

    return server;
}
