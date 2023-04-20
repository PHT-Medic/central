/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainType,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@ebec/http';
import type { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../type';
import { decrSocketRoomConnections, incrSocketRoomConnections } from '../../utils';

export function registerStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.STATION, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.STATION_EDIT)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainType.STATION, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.STATION, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainType.STATION, target));
        },
    );
}
