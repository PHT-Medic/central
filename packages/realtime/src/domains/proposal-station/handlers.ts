/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, buildSocketProposalStationRoomName,
} from '@personalhealthtrain/ui-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';

export function registerProposalStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    socket.on('proposalStationsSubscribe', async (context, cb) => {
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

        socket.join(buildSocketProposalStationRoomName(context.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on('proposalStationsUnsubscribe', (context) => {
        context ??= {};

        socket.leave(buildSocketProposalStationRoomName(context.id));
    });
}
