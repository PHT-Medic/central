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
    TrainLogSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketTrainLogRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config';
import { TrainLogEntity } from '../../domains/core/train-log';

function publish(
    operation: `${TrainLogSocketServerToClientEventName}`,
    item: TrainLogEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketTrainLogRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketTrainLogRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainLogSubscriber implements EntitySubscriberInterface<TrainLogEntity> {
    listenTo(): CallableFunction | string {
        return TrainLogEntity;
    }

    afterInsert(event: InsertEvent<TrainLogEntity>): Promise<any> | void {
        publish(TrainLogSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<TrainLogEntity>): Promise<any> | void {
        publish(TrainLogSocketServerToClientEventName.UPDATED, event.entity as TrainLogEntity);
    }

    beforeRemove(event: RemoveEvent<TrainLogEntity>): Promise<any> | void {
        publish(TrainLogSocketServerToClientEventName.DELETED, event.entity);
    }
}
