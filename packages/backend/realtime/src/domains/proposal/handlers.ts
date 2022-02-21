/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    buildSocketProposalRoomName,
    extendSocketClientToServerEventCallback,
    extendSocketClientToServerEventContext,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';
import { decrSocketRoomConnections, incrSocketRoomConnections } from '../../config/socket/utils';

export function registerProposalSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user && !socket.data.robot) return;

    socket.on('proposalsSubscribe', async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_DROP) &&
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_EDIT)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketProposalRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on('proposalsUnsubscribe', (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketProposalRoomName(context.data.id));
    });
}
