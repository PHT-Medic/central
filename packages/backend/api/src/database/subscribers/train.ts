/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import {
    TrainSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketTrainRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { TrainEntity } from '../../domains/core/train/entity';

function publish(
    operation: `${TrainSocketServerToClientEventName}`,
    item: TrainEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketTrainRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketTrainRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<TrainEntity> {
    listenTo(): CallableFunction | string {
        return TrainEntity;
    }

    afterInsert(event: InsertEvent<TrainEntity>): Promise<any> | void {
        publish(TrainSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainEntity>): Promise<any> | void {
        publish(TrainSocketServerToClientEventName.UPDATED, event.entity as TrainEntity);
    }

    beforeRemove(event: RemoveEvent<TrainEntity>): Promise<any> | void {
        publish(TrainSocketServerToClientEventName.DELETED, event.entity);
    }
}
