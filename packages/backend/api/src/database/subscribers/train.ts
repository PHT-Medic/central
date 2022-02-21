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
    buildSocketRealmNamespaceName,
    buildSocketTrainRoomName,
} from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { TrainEntity } from '../../domains/core/train/entity';

type Operator = 'create' | 'update' | 'delete';
type Event = 'trainCreated' | 'trainUpdated' | 'trainDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'trainCreated',
    update: 'trainUpdated',
    delete: 'trainDeleted',
};

function publish(
    operation: Operator,
    item: TrainEntity,
) {
    useSocketEmitter()
        .in(buildSocketTrainRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketTrainRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketTrainRoomName(item.id))
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName: buildSocketTrainRoomName(item.id),
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
            .in(buildSocketTrainRoomName())
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName: buildSocketTrainRoomName(),
                },
            });
    }

    if (operation !== 'create') {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketTrainRoomName(item.id))
                .emit(OperatorEventMap[operation], {
                    data: item,
                    meta: {
                        roomName: buildSocketTrainRoomName(item.id),
                        roomId: item.id,
                    },
                });
        }
    }
}

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<TrainEntity> {
    listenTo(): CallableFunction | string {
        return TrainEntity;
    }

    afterInsert(event: InsertEvent<TrainEntity>): Promise<any> | void {
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainEntity>): Promise<any> | void {
        publish('update', event.entity as TrainEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<TrainEntity>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
