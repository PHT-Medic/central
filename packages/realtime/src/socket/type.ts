/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import type {
    AbilityManager, Realm, Robot, User,
} from '@authup/core';
import type { Namespace, Server, Socket } from 'socket.io';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';

export type SocketDataInterface = {
    ability?: AbilityManager,

    realmId?: Realm['id'],
    realmName?: Realm['name'],

    userId?: User['id'],
    robotId?: Robot['id'],

    roomConnections: Record<string, number>
};

export type SocketServerInterface = Server<
SocketClientToServerEvents,
SocketServerToClientEvents,
DefaultEventsMap,
SocketDataInterface
>;

export type SocketNamespaceInterface = Namespace<
SocketClientToServerEvents,
SocketServerToClientEvents,
DefaultEventsMap,
SocketDataInterface
>;

export type SocketInterface = Socket<
SocketClientToServerEvents,
SocketServerToClientEvents,
DefaultEventsMap,
SocketDataInterface
>;
