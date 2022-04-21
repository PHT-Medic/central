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
    Proposal,
    ProposalSocketServerToClientEventName,
    buildSocketProposalRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { ProposalEntity } from '../../domains/core/proposal/entity';

function publish(
    operation: `${ProposalSocketServerToClientEventName}`,
    item: Proposal,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketProposalStationOutRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketProposalRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class ProposalSubscriber implements EntitySubscriberInterface<ProposalEntity> {
    listenTo(): CallableFunction | string {
        return ProposalEntity;
    }

    afterInsert(event: InsertEvent<ProposalEntity>): Promise<any> | void {
        publish(ProposalSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<ProposalEntity>): Promise<any> | void {
        publish(ProposalSocketServerToClientEventName.UPDATED, event.entity as ProposalEntity);
    }

    beforeRemove(event: RemoveEvent<ProposalEntity>): Promise<any> | void {
        publish(ProposalSocketServerToClientEventName.DELETED, event.entity);
    }
}
