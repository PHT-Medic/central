/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    StationSocketServerToClientEventName,
    buildSocketRealmNamespaceName,
    buildSocketStationRoomName,
} from '@personalhealthtrain/central-common';
import type {
    DataSource,
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { emitSocketServerToClientEvent } from '../../config';
import { useAuthupClient } from '../../core';
import { StationEntity } from '../../domains';

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

async function createRobot(dataSource: DataSource, entity: StationEntity) {
    const authupClient = useAuthupClient();
    const response = await authupClient.robot.getMany({
        page: {
            limit: 1,
        },
        filter: {
            name: entity.id,
            realm_id: entity.realm_id,
        },
    });
    if (response.data.length === 0) {
        await authupClient.robot.create({
            name: entity.id,
            realm_id: entity.realm_id,
        });
    }
}

async function deleteRobot(dataSource: DataSource, entity: StationEntity) {
    const authupClient = useAuthupClient();
    const response = await authupClient.robot.getMany({
        page: {
            limit: 1,
        },
        filter: {
            name: entity.id,
            realm_id: entity.realm_id,
        },
    });
    if (response.data.length === 1) {
        await authupClient.robot.delete(response.data[0].id);
    }
}

@EventSubscriber()
export class StationSubscriber implements EntitySubscriberInterface<StationEntity> {
    listenTo(): CallableFunction | string {
        return StationEntity;
    }

    afterInsert(event: InsertEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.CREATED, event.entity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            Promise.resolve()
                .then(() => createRobot(event.connection, event.entity));
        }
    }

    afterUpdate(event: UpdateEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.UPDATED, event.entity as StationEntity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            Promise.resolve()
                .then(() => createRobot(event.connection, event.entity as StationEntity));
        }
    }

    beforeRemove(event: RemoveEvent<StationEntity>): Promise<any> | void {
        publish(StationSocketServerToClientEventName.DELETED, event.entity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            Promise.resolve()
                .then(() => deleteRobot(event.connection, event.entity));
        }
    }
}
