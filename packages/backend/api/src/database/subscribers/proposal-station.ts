/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import {
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName,
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { ProposalStationEntity } from '../../domains/core/proposal-station/entity';

enum Operation {
    CREATE = 'proposalStationCreated',
    UPDATE = 'proposalStationUpdated',
    DELETE = 'proposalStationDeleted',
}

type EmitRecord = {
    namespace?: string,
    roomNameFn: (id?: string) => string
};

function publish(
    operation: `${Operation}`,
    item: ProposalStationEntity,
) {
    const items : EmitRecord[] = [
        {
            roomNameFn: buildSocketProposalStationInRoomName,
            namespace: buildSocketRealmNamespaceName(item.station_realm_id),
        },
        {
            roomNameFn: buildSocketProposalStationOutRoomName,
            namespace: buildSocketRealmNamespaceName(item.proposal_realm_id),
        },
        { roomNameFn: buildSocketProposalStationRoomName },
        { roomNameFn: buildSocketProposalStationInRoomName },
        { roomNameFn: buildSocketProposalStationOutRoomName },
    ];

    for (let i = 0; i < items.length; i++) {
        let emitter = useSocketEmitter();
        if (items[i].namespace) {
            emitter = emitter.of(items[i].namespace);
        }

        let roomName = items[i].roomNameFn();
        emitter
            .in(roomName)
            .emit(operation, {
                data: item,
                meta: {
                    roomName,
                },
            });

        roomName = items[i].roomNameFn(item.id);
        emitter
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
