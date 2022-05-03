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
    StationSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketStationRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { StationEntity } from '../../domains/core/station/entity';

function publish(
    operation: `${StationSocketServerToClientEventName}`,
    item: StationEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketStationRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketStationRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<StationEntity> {
    listenTo(): CallableFunction | string {
        return StationEntity;
    }

    afterInsert(event: InsertEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.UPDATED, event.entity as StationEntity);
    }

    beforeRemove(event: RemoveEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.DELETED, event.entity);
    }
}
