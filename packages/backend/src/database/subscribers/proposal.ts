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
    buildSocketProposalRoomName,
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';

type Operator = 'create' | 'update' | 'delete';
type Event = 'proposalCreated' | 'proposalUpdated' | 'proposalDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'proposalCreated',
    update: 'proposalUpdated',
    delete: 'proposalDeleted',
};

function publish(
    operation: Operator,
    item: Proposal,
) {
    useSocketEmitter()
        .in(buildSocketProposalRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketProposalRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketProposalRoomName(item.id))
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName: buildSocketProposalRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        useSocketEmitter()
            .of(workspaces[i])
            .in(buildSocketProposalRoomName())
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName: buildSocketProposalRoomName(),
                },
            });
    }

    if (operation !== 'create') {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketProposalRoomName(item.id))
                .emit(OperatorEventMap[operation], {
                    data: item,
                    meta: {
                        roomName: buildSocketProposalRoomName(item.id),
                        roomId: item.id,
                    },
                });
        }
    }
}

@EventSubscriber()
export class ProposalSubscriber implements EntitySubscriberInterface<Proposal> {
    listenTo(): CallableFunction | string {
        return Proposal;
    }

    afterInsert(event: InsertEvent<Proposal>): Promise<any> | void {
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<Proposal>): Promise<any> | void {
        publish('update', event.entity as Proposal);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<Proposal>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
