/*
 * Copyright (c) 2021-2021.
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
    TrainStationSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName, buildSocketTrainStationRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { TrainStationEntity } from '../../domains/core/train-station/entity';

function publish(
    operation: `${TrainStationSocketServerToClientEventName}`,
    item: TrainStationEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
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
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainStationSubscriber implements EntitySubscriberInterface<TrainStationEntity> {
    listenTo(): CallableFunction | string {
        return TrainStationEntity;
    }

    afterInsert(event: InsertEvent<TrainStationEntity>): Promise<any> | void {
        publish(TrainStationSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainStationEntity>): Promise<any> | void {
        publish(TrainStationSocketServerToClientEventName.UPDATED, event.entity as TrainStationEntity);
    }

    beforeRemove(event: RemoveEvent<TrainStationEntity>): Promise<any> | void {
        publish(TrainStationSocketServerToClientEventName.DELETED, event.entity);
    }
}
