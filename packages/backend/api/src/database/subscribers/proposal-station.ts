/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import {
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName, buildSocketProposalStationRoomName, buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { ProposalStationEntity } from '../../domains/core/proposal-station/entity';

enum Operation {
    CREATE = 'proposalStationCreated',
    UPDATE = 'proposalStationUpdated',
    DELETE = 'proposalStationDeleted',
}

function publish(
    operation: `${Operation}`,
    item: ProposalStationEntity,
) {
    useSocketEmitter()
        .in(buildSocketProposalStationRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketProposalStationRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketProposalStationRoomName(item.id))
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketProposalStationRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.station_realm_id),
        buildSocketRealmNamespaceName(item.proposal_realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        const roomName = workspaces[i] === buildSocketRealmNamespaceName(item.station_realm_id) ?
            buildSocketProposalStationInRoomName() :
            buildSocketProposalStationOutRoomName();

        useSocketEmitter()
            .of(workspaces[i])
            .in(roomName)
            .emit(operation, {
                data: item,
                meta: {
                    roomName,
                },
            });
    }

    if (operation !== Operation.CREATE) {
        for (let i = 0; i < workspaces.length; i++) {
            const roomName = workspaces[i] === buildSocketRealmNamespaceName(item.station_realm_id) ?
                buildSocketProposalStationInRoomName(item.id) :
                buildSocketProposalStationOutRoomName(item.id);

            useSocketEmitter()
                .of(workspaces[i])
                .in(roomName)
                .emit(operation, {
                    data: item,
                    meta: {
                        roomName,
                        roomId: item.id,
                    },
                });
        }
    }
}

@EventSubscriber()
export class ProposalStationSubscriber implements EntitySubscriberInterface<ProposalStationEntity> {
    listenTo(): CallableFunction | string {
        return ProposalStationEntity;
    }

    afterInsert(event: InsertEvent<ProposalStationEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<ProposalStationEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as ProposalStationEntity);
    }

    beforeRemove(event: RemoveEvent<ProposalStationEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);
    }
}
