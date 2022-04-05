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

type EmitRecord = {
    namespace?: string,
    roomNameFn: (id?: string) => string
};

function publish(
    operation: `${Operation}`,
    item: TrainStationEntity,
) {
    const items : EmitRecord[] = [
        {
            namespace: buildSocketRealmNamespaceName(item.station_realm_id),
            roomNameFn: buildSocketTrainStationInRoomName,
        },
        {
            namespace: buildSocketRealmNamespaceName(item.train_realm_id),
            roomNameFn: buildSocketTrainStationOutRoomName,
        },
        {
            roomNameFn: buildSocketTrainStationRoomName,
        },
        {
            roomNameFn: buildSocketTrainStationInRoomName,
        },
        {
            roomNameFn: buildSocketTrainStationOutRoomName,
        },
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
