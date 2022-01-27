/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    SocketClientToServerEvents,
    SocketInterServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/ui-common';
import {
    AbilityManager, PermissionItem, Robot, User,
} from '@typescript-auth/domains';
import { Namespace, Server, Socket } from 'socket.io';

export type SocketDataInterface = {
    token?: string,

    user?: User,
    userId?: User['id'],

    robot?: Robot,
    robotId?: Robot['id'],

    permissions?: PermissionItem<any>[],
    ability?: AbilityManager,

    roomConnections: Record<string, number>
};

export type SocketServerInterface = Server<
SocketClientToServerEvents,
SocketServerToClientEvents,
SocketInterServerEvents,
SocketDataInterface
>;

export type SocketNamespaceInterface = Namespace<
SocketClientToServerEvents,
SocketServerToClientEvents,
SocketInterServerEvents,
SocketDataInterface
>;

export type SocketInterface = Socket<
SocketClientToServerEvents,
SocketServerToClientEvents,
SocketInterServerEvents,
SocketDataInterface
>;
