/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ForbiddenError, UnauthorizedError } from '@ebec/http';
import { REALM_MASTER_NAME } from '@authup/common';
import { setupSocketMiddleware } from '@authup/server-adapter';
import { useEnv } from '../config';
import { useLogger } from '../core';
import { registerSocketHandlers, registerSocketNamespaceHandlers } from './register';
import type { SocketInterface, SocketServerInterface } from './type';
import type { Config } from '../config';

interface SocketServerContext {
    httpServer: HTTPServer,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
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

    useLogger().info('Mounting socket middleware...');
    // receive user
    server.use(setupSocketMiddleware({
        redis: context.config.redisDatabase,
        oauth2: useEnv('authupApiUrl'),
        logger: useLogger(),
    }));

    server.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Client is not authenticated.');
            next(new UnauthorizedError());
            return;
        }

        if (socket.data.realmName !== REALM_MASTER_NAME) {
            useLogger().error(`Realm ${socket.data.realmName} is not permitted for the global scope.`);
            next(new ForbiddenError());

            return;
        }

        if (socket.data.userId) {
            useLogger().debug(`User ${socket.data.userId} (${socket.id}) connected.`);
        } else if (socket.data.robotId) {
            useLogger().debug(`Robot ${socket.data.robotId} (${socket.id}) connected.`);
        }

        next();
    });

    useLogger().info('Registering socket controllers...');

    // register handlers
    registerSocketHandlers(server);

    // build & register realm workspaces
    const realmWorkspaces = server.of(/^\/realm#[a-z0-9A-Z-_]+$/);
    realmWorkspaces.use(setupSocketMiddleware({
        redis: context.config.redisDatabase,
        oauth2: useEnv('authupApiUrl'),
    }));

    realmWorkspaces.use((socket: SocketInterface, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Client is not authenticated.');

            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/realm#([a-z0-9A-Z-_]+)$/);

        if (matches[1] !== socket.data.realmId && socket.data.realmName !== REALM_MASTER_NAME) {
            useLogger().error(`Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`);
            next(new ForbiddenError());
            return;
        }

        if (socket.data.userId) {
            useLogger().debug(`User ${socket.data.userId} (${socket.id}) connected.`);
        } else if (socket.data.robotId) {
            useLogger().debug(`Robot ${socket.data.robotId} (${socket.id}) connected.`);
        }

        next();
    });

    registerSocketNamespaceHandlers(realmWorkspaces);

    return server;
}
