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
    isSocketClientToServerEventCallback, isSocketClientToServerEventErrorCallback,
} from '@personalhealthtrain/central-common';
import { UnauthorizedError } from '@ebec/http';
import { buildDomainEventChannelName } from '@personalhealthtrain/central-server-common/src/domain-event/utils';
import type {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
} from '../../type';
import {
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../utils';

export function registerProposalStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.PROPOSAL_STATION, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainType.PROPOSAL_STATION, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.PROPOSAL_STATION, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainType.PROPOSAL_STATION, target));
        },
    );
}

export function registerProposalStationForRealmSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROPOSAL_STATION_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(
                socket,
                buildDomainEventChannelName(DomainSubType.PROPOSAL_STATION_IN, target),
            );

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROPOSAL_STATION_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(
                socket,
                buildDomainEventChannelName(DomainSubType.PROPOSAL_STATION_IN, target),
            );
        },
    );

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROPOSAL_STATION_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROPOSAL_EDIT)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(
                socket,
                buildDomainEventChannelName(DomainSubType.PROPOSAL_STATION_OUT, target),
            );

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROPOSAL_STATION_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(
                socket,
                buildDomainEventChannelName(DomainSubType.PROPOSAL_STATION_OUT, target),
            );
        },
    );
}
