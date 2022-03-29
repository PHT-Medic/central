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
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName,
    buildSocketTrainStationRoomName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { TrainStationEntity } from '../../domains/core/train-station/entity';

enum Operation {
    CREATE = 'trainStationCreated',
    UPDATE = 'trainStationUpdated',
    DELETE = 'trainStationDeleted',
}

function publish(
    operation: `${Operation}`,
    item: TrainStationEntity,
) {
    useSocketEmitter()
        .in(buildSocketTrainStationRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketTrainStationRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketTrainStationRoomName(item.id))
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketTrainStationRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.station_realm_id),
        buildSocketRealmNamespaceName(item.train_realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        const roomName = workspaces[i] === buildSocketRealmNamespaceName(item.station_realm_id) ?
            buildSocketTrainStationInRoomName() :
            buildSocketTrainStationOutRoomName();

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
                buildSocketTrainStationInRoomName(item.id) :
                buildSocketTrainStationOutRoomName(item.id);

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
export class TrainStationSubscriber implements EntitySubscriberInterface<TrainStationEntity> {
    listenTo(): CallableFunction | string {
        return TrainStationEntity;
    }

    afterInsert(event: InsertEvent<TrainStationEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainStationEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as TrainStationEntity);
    }

    beforeRemove(event: RemoveEvent<TrainStationEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);
    }
}
