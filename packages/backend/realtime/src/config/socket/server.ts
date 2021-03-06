/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ForbiddenError, UnauthorizedError } from '@typescript-error/http';
import { MASTER_REALM_ID } from '@authelion/common';
import { setupSocketMiddleware } from '@authelion/api-adapter';
import { useClient } from '@trapi/client';
import { useLogger } from '../log';
import { registerSocketHandlers, registerSocketNamespaceHandlers } from './handlers';
import { Environment } from '../../env';
import { SocketInterface, SocketServerInterface } from './type';
import { Config } from '../type';

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
        http: useClient().driver,
    }));

    server.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            next(new UnauthorizedError());
            return;
        }

        if (socket.data.realmId !== MASTER_REALM_ID) {
            next(new ForbiddenError());
        }
    });

    // register handlers
    registerSocketHandlers(server);

    // build & register realm workspaces
    const realmWorkspaces = server.of(/^\/realm#[a-z0-9A-Z-_]+$/);
    realmWorkspaces.use(setupSocketMiddleware({
        redis: context.config.redisDatabase,
        http: useClient().driver,
    }));

    realmWorkspaces.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/realm#([a-z0-9A-Z-_]+)$/);

        if (matches[1] === socket.data.realmId || socket.data.realmId === MASTER_REALM_ID) {
            next();
        } else {
            next(new ForbiddenError());
        }
    });

    registerSocketNamespaceHandlers(realmWorkspaces);

    return server;
}
