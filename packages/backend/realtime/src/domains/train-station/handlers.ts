/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    TrainStationSocketClientToServerEventName,
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName,
    buildSocketTrainStationRoomName,
    extendSocketClientToServerEventCallback,
    extendSocketClientToServerEventContext,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';
import { decrSocketRoomConnections, incrSocketRoomConnections } from '../../config/socket/utils';

export function registerTrainStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user && !socket.data.robot) return;

    // ------------------------------------------------------------

    socket.on(TrainStationSocketClientToServerEventName.SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.hasPermission(PermissionID.TRAIN_APPROVE)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketTrainStationRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(TrainStationSocketClientToServerEventName.UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketTrainStationRoomName(context.data.id));
    });
}

export function registerTrainStationForRealmSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user && !socket.data.robot) return;

    // ------------------------------------------------------------

    socket.on(TrainStationSocketClientToServerEventName.IN_SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.hasPermission(PermissionID.TRAIN_APPROVE)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketTrainStationInRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(TrainStationSocketClientToServerEventName.IN_UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketTrainStationInRoomName(context.data.id));
    });

    // ----------------------------------------------------------

    socket.on(TrainStationSocketClientToServerEventName.OUT_SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.hasPermission(PermissionID.TRAIN_EDIT)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketTrainStationOutRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(TrainStationSocketClientToServerEventName.OUT_UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketTrainStationOutRoomName(context.data.id));
    });
}
