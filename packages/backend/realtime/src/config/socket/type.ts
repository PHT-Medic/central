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
} from '@personalhealthtrain/central-common';
import {
    AbilityDescriptor, AbilityManager, Realm, Robot, User,
} from '@authelion/common';
import { Namespace, Server, Socket } from 'socket.io';

export type SocketDataInterface = {
    token?: string,

    realmId?: Realm['id'],

    userId?: User['id'],

    robotId?: Robot['id'],

    permissions?: AbilityDescriptor[],
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
