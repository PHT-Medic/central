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
    buildSocketTrainFileRoomName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { TrainFileEntity } from '../../domains/core/train-file/entity';

enum Operation {
    CREATE = 'trainFileCreated',
    UPDATE = 'trainFileUpdated',
    DELETE = 'trainFileDeleted',
}

function publish(
    operation: `${Operation}`,
    item: TrainFileEntity,
) {
    useSocketEmitter()
        .in(buildSocketTrainFileRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketTrainFileRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketTrainFileRoomName(item.id))
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketTrainFileRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        const roomName = buildSocketTrainFileRoomName();

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
            const roomName = buildSocketTrainFileRoomName(item.id);

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
export class TrainFileSubscriber implements EntitySubscriberInterface<TrainFileEntity> {
    listenTo(): CallableFunction | string {
        return TrainFileEntity;
    }

    afterInsert(event: InsertEvent<TrainFileEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainFileEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as TrainFileEntity);
    }

    beforeRemove(event: RemoveEvent<TrainFileEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);
    }
}
