/*
 * Copyright (c) 2021-2022.
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
    ProposalStationSocketServerToClientEventName,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName,
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { ProposalStationEntity } from '../../domains/core/proposal-station/entity';

function publish(
    operation: `${ProposalStationSocketServerToClientEventName}`,
    item: ProposalStationEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketProposalStationInRoomName,
                namespace: buildSocketRealmNamespaceName(item.station_realm_id),
            },
            {
                roomNameFn: buildSocketProposalStationOutRoomName,
                namespace: buildSocketRealmNamespaceName(item.proposal_realm_id),
            },
            {
                roomNameFn: buildSocketProposalStationRoomName,
            },
            {
                roomNameFn: buildSocketProposalStationInRoomName,
            },
            {
                roomNameFn: buildSocketProposalStationOutRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class ProposalStationSubscriber implements EntitySubscriberInterface<ProposalStationEntity> {
    listenTo(): CallableFunction | string {
        return ProposalStationEntity;
    }

    afterInsert(event: InsertEvent<ProposalStationEntity>): Promise<any> | void {
        publish(ProposalStationSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<ProposalStationEntity>): Promise<any> | void {
        publish(ProposalStationSocketServerToClientEventName.UPDATED, event.entity as ProposalStationEntity);
    }

    beforeRemove(event: RemoveEvent<ProposalStationEntity>): Promise<any> | void {
        publish(ProposalStationSocketServerToClientEventName.DELETED, event.entity);
    }
}
