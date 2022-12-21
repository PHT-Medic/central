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
    TrainFileSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketTrainFileRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { TrainFileEntity } from '../../domains/core/train-file/entity';

function publish(
    operation: `${TrainFileSocketServerToClientEventName}`,
    item: TrainFileEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketTrainFileRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketTrainFileRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainFileSubscriber implements EntitySubscriberInterface<TrainFileEntity> {
    listenTo(): CallableFunction | string {
        return TrainFileEntity;
    }

    afterInsert(event: InsertEvent<TrainFileEntity>): Promise<any> | void {
        publish(TrainFileSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainFileEntity>): Promise<any> | void {
        publish(TrainFileSocketServerToClientEventName.UPDATED, event.entity as TrainFileEntity);
    }

    beforeRemove(event: RemoveEvent<TrainFileEntity>): Promise<any> | void {
        publish(TrainFileSocketServerToClientEventName.DELETED, event.entity);
    }
}
