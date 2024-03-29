/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@personalhealthtrain/core';
import { UnauthorizedError } from '@ebec/http';
import type {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
} from '../../type';
import {
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../utils';

export function registerTrainStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.TRAIN_STATION, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.TRAIN_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainType.TRAIN_STATION, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.TRAIN_STATION, DomainEventSubscriptionName.SUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainType.TRAIN_STATION, target));
        },
    );
}

export function registerTrainStationForRealmSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.TRAIN_STATION_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.TRAIN_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainSubType.TRAIN_STATION_IN, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.TRAIN_STATION_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainSubType.TRAIN_STATION_IN, target));
        },
    );

    // ----------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.TRAIN_STATION_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (!socket.data.ability.has(PermissionID.TRAIN_EDIT)) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.TRAIN_STATION_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT, target));
        },
    );
}
