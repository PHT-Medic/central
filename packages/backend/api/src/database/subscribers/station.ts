/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { buildSocketRealmNamespaceName, buildSocketStationRoomName } from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { StationEntity } from '../../domains/core/station/entity';

enum Operation {
    CREATE = 'stationCreated',
    UPDATE = 'stationUpdated',
    DELETE = 'stationDeleted',
}

function publish(
    operation: `${Operation}`,
    item: StationEntity,
) {
    useSocketEmitter()
        .in(buildSocketStationRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketStationRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketStationRoomName(item.id))
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketStationRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        useSocketEmitter()
            .of(workspaces[i])
            .in(buildSocketStationRoomName())
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketStationRoomName(),
                },
            });
    }

    if (operation !== Operation.CREATE) {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketStationRoomName(item.id))
                .emit(operation, {
                    data: item,
                    meta: {
                        roomName: buildSocketStationRoomName(item.id),
                        roomId: item.id,
                    },
                });
        }
    }
}

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<StationEntity> {
    listenTo(): CallableFunction | string {
        return StationEntity;
    }

    afterInsert(event: InsertEvent<StationEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<StationEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as StationEntity);
    }

    beforeRemove(event: RemoveEvent<StationEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);
    }
}
