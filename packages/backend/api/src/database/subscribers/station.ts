/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { buildSocketRealmNamespaceName, buildSocketStationRoomName } from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { StationEntity } from '../../domains/core/station/entity';

type Operator = 'create' | 'update' | 'delete';
type Event = 'stationCreated' | 'stationUpdated' | 'stationDeleted';

const OperatorEventMap : Record<Operator, Event> = {
    create: 'stationCreated',
    update: 'stationUpdated',
    delete: 'stationDeleted',
};

function publish(
    operation: Operator,
    item: StationEntity,
) {
    useSocketEmitter()
        .in(buildSocketStationRoomName())
        .emit(OperatorEventMap[operation], {
            data: item,
            meta: {
                roomName: buildSocketStationRoomName(),
            },
        });

    if (operation !== 'create') {
        useSocketEmitter()
            .in(buildSocketStationRoomName(item.id))
            .emit(OperatorEventMap[operation], {
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
            .emit(OperatorEventMap[operation], {
                data: item,
                meta: {
                    roomName: buildSocketStationRoomName(),
                },
            });
    }

    if (operation !== 'create') {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketStationRoomName(item.id))
                .emit(OperatorEventMap[operation], {
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
        publish('create', event.entity);
    }

    afterUpdate(event: UpdateEvent<StationEntity>): Promise<any> | void {
        publish('update', event.entity as StationEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<StationEntity>): Promise<any> | void {
        publish('delete', event.entity);

        return undefined;
    }
}
