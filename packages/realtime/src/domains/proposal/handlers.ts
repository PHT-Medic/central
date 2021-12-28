/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, buildSocketProposalRoomName,
} from '@personalhealthtrain/ui-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';

export function registerProposalSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    socket.on('proposalsSubscribe', async (context, cb) => {
        context ??= {};

        if (
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_DROP) &&
            !socket.data.ability.hasPermission(PermissionID.PROPOSAL_EDIT)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        socket.join(buildSocketProposalRoomName(context.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on('proposalsUnsubscribe', (context) => {
        context ??= {};

        socket.leave(buildSocketProposalRoomName(context.id));
    });
}
