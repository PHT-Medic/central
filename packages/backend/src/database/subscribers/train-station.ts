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
} from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { TrainStationEntity } from '../../domains/core/train-station/entity';

type Operator = 'create' | 'update' | 'delete';
type Event = 'trainStationCreated' | 'trainStationUpdated' | 'trainStationDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'trainStationCreated',
    update: 'trainStationUpdated',
    delete: 'trainStationDeleted',
};

function publish(
    operation: Operator,
    item: TrainStationEntity,
) {
    useSocketEmitter()
        .in(buildSocketTrainStationRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketTrainStationRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketTrainStationRoomName(item.id))
            .emit(OperatorEventMap[operation], {
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
                buildSocketTrainStationInRoomName(item.id) :
                buildSocketTrainStationOutRoomName(item.id);

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
export class TrainStationSubscriber implements EntitySubscriberInterface<TrainStationEntity> {
    listenTo(): CallableFunction | string {
        return TrainStationEntity;
    }

    afterInsert(event: InsertEvent<TrainStationEntity>): Promise<any> | void {
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainStationEntity>): Promise<any> | void {
        publish('update', event.entity as TrainStationEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<TrainStationEntity>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
