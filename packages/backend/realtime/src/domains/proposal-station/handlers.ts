/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    ProposalStationSocketClientToServerEventName,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName,
    extendSocketClientToServerEventCallback,
    extendSocketClientToServerEventContext,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@typescript-error/http';
import {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../config';

export function registerProposalStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(ProposalStationSocketClientToServerEventName.SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketProposalStationRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(ProposalStationSocketClientToServerEventName.UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketProposalStationRoomName(context.data.id));
    });
}

export function registerProposalStationForRealmSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(ProposalStationSocketClientToServerEventName.IN_SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketProposalStationInRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(ProposalStationSocketClientToServerEventName.IN_UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketProposalStationInRoomName(context.data.id));
    });

    // ------------------------------------------------------------

    socket.on(ProposalStationSocketClientToServerEventName.OUT_SUBSCRIBE, async (context, cb) => {
        context = extendSocketClientToServerEventContext(context);
        cb = extendSocketClientToServerEventCallback(cb);

        if (
            !socket.data.ability.has(PermissionID.PROPOSAL_EDIT)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        incrSocketRoomConnections(socket, buildSocketProposalStationOutRoomName(context.data.id));

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on(ProposalStationSocketClientToServerEventName.OUT_UNSUBSCRIBE, (context) => {
        context = extendSocketClientToServerEventContext(context);

        decrSocketRoomConnections(socket, buildSocketProposalStationOutRoomName(context.data.id));
    });
}
