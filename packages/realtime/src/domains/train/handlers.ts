/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    TrainSocketClientToServerEventName,
    buildSocketTrainRoomName,
    extendSocketClientToServerEventCallback, extendSocketClientToServerEventContext,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@ebec/http';
import {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../config';

export function registerTrainSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(TrainSocketClientToServerEventName.SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.has(PermissionID.TRAIN_EDIT) &&
            !socket.data.ability.has(PermissionID.TRAIN_EXECUTION_START) &&
            !socket.data.ability.has(PermissionID.TRAIN_EXECUTION_STOP)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketTrainRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(TrainSocketClientToServerEventName.UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketTrainRoomName(context.data.id));
    });
}
