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
    buildSocketProposalRoomName, buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { ProposalEntity } from '../../domains/core/proposal/entity';

enum Operation {
    CREATE = 'proposalCreated',
    UPDATE = 'proposalUpdated',
    DELETE = 'proposalDeleted',
}

function publish(
    operation: `${Operation}`,
    item: Proposal,
) {
    useSocketEmitter()
        .in(buildSocketProposalRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketProposalRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketProposalRoomName(item.id))
            .emit(operation, {
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
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketProposalRoomName(),
                },
            });
    }

    if (operation !== Operation.CREATE) {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketProposalRoomName(item.id))
                .emit(operation, {
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
export class ProposalSubscriber implements EntitySubscriberInterface<ProposalEntity> {
    listenTo(): CallableFunction | string {
        return ProposalEntity;
    }

    afterInsert(event: InsertEvent<ProposalEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<ProposalEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as ProposalEntity);
    }

    beforeRemove(event: RemoveEvent<ProposalEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);
    }
}
