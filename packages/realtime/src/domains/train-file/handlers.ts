/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    TrainFileSocketClientToServerEventName,
    buildSocketTrainFileRoomName,
    extendSocketClientToServerEventCallback,
    extendSocketClientToServerEventContext,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@ebec/http';
import type {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
} from '../../config';
import {
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../config';

export function registerTrainFileSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(TrainFileSocketClientToServerEventName.SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.has(PermissionID.TRAIN_EDIT)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketTrainFileRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(TrainFileSocketClientToServerEventName.UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketTrainFileRoomName(context.data.id));
    });
}
