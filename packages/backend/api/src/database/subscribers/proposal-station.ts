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
} from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { ProposalStationEntity } from '../../domains/core/proposal-station/entity';

type Operator = 'create' | 'update' | 'delete';
type Event = 'proposalStationCreated' | 'proposalStationUpdated' | 'proposalStationDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'proposalStationCreated',
    update: 'proposalStationUpdated',
    delete: 'proposalStationDeleted',
};

function publish(
    operation: Operator,
    item: ProposalStationEntity,
) {
    useSocketEmitter()
        .in(buildSocketProposalStationRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketProposalStationRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketProposalStationRoomName(item.id))
            .emit(OperatorEventMap[operation], {
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
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName,
                },
            });
    }

    if (operation !== 'create') {
        for (let i = 0; i < workspaces.length; i++) {
            const roomName = workspaces[i] === buildSocketRealmNamespaceName(item.station_realm_id) ?
                buildSocketProposalStationInRoomName(item.id) :
                buildSocketProposalStationOutRoomName(item.id);

            useSocketEmitter()
                .of(workspaces[i])
                .in(roomName)
                .emit(OperatorEventMap[operation], {
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
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<ProposalStationEntity>): Promise<any> | void {
        publish('update', event.entity as ProposalStationEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<ProposalStationEntity>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
