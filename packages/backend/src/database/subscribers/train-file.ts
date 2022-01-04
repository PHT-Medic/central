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
    TrainFile,
    buildSocketRealmNamespaceName,
    buildSocketTrainFileRoomName,
} from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';

type Operator = 'create' | 'update' | 'delete';
type Event = 'trainFileCreated' | 'trainFileUpdated' | 'trainFileDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'trainFileCreated',
    update: 'trainFileUpdated',
    delete: 'trainFileDeleted',
};

function publish(
    operation: Operator,
    item: TrainFile,
) {
    useSocketEmitter()
        .in(buildSocketTrainFileRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketTrainFileRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketTrainFileRoomName(item.id))
            .emit(OperatorEventMap[operation], {
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
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName,
                },
            });
    }

    if (operation !== 'create') {
        for (let i = 0; i < workspaces.length; i++) {
            const roomName = buildSocketTrainFileRoomName(item.id);

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
export class TrainFileSubscriber implements EntitySubscriberInterface<TrainFile> {
    listenTo(): CallableFunction | string {
        return TrainFile;
    }

    afterInsert(event: InsertEvent<TrainFile>): Promise<any> | void {
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainFile>): Promise<any> | void {
        publish('update', event.entity as TrainFile);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<TrainFile>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
