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
import {
    AbilityManager, OAuth2SubKind, REALM_MASTER_NAME, ROBOT_SYSTEM_NAME,
} from '@authup/core';
import { createSocketMiddleware } from '@authup/server-adapter';
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

    const socketMiddleware = createSocketMiddleware({
        tokenVerifier: {
            baseURL: useEnv('authupApiUrl'),
            creator: {
                type: 'robotInVault',
                name: ROBOT_SYSTEM_NAME,
                vault: useEnv('vaultConnectionString'),
            },
            cache: {
                type: 'redis',
                client: context.config.redisDatabase,
            },
        },
        tokenVerifierHandler: (socket: SocketInterface, data) => {
            switch (data.sub_kind) {
                case OAuth2SubKind.USER: {
                    socket.data.userId = data.sub;
                    break;
                }
                case OAuth2SubKind.ROBOT: {
                    socket.data.robotId = data.sub;
                    break;
                }
            }

            socket.data.realmId = data.realm_id;
            socket.data.realmName = data.realm_name;
            socket.data.ability = new AbilityManager(data.permissions);
        },
    });

    useLogger().info('Mounting socket middleware...');
    server.use(socketMiddleware);

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
    realmWorkspaces.use(socketMiddleware);

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
