/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, buildSocketTrainStationRoomName,
} from '@personalhealthtrain/ui-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';

export function registerTrainStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    socket.on('trainStationsSubscribe', async (context, cb) => {
        context ??= {};

        if (
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_APPROVE) &&
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_ADD) &&
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_EDIT) &&
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_DROP)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        socket.join(buildSocketTrainStationRoomName(context.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on('trainStationsUnsubscribe', (context) => {
        context ??= {};

        socket.leave(buildSocketTrainStationRoomName(context.id));
    });
}
