/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RobotRepository } from '@authup/server-database';
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
import { StationEntity } from '../../domains/station';

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
    const robotRepository = new RobotRepository(dataSource);
    const robot = await robotRepository.findOneBy({
        name: entity.id,
        realm_id: entity.realm_id,
    });

    if (!robot) {
        const { entity: robot } = await robotRepository.createWithSecret({
            name: entity.id,
            realm_id: entity.realm_id,
        });

        await robotRepository.save(robot);
    }
}

async function deleteRobot(dataSource: DataSource, entity: StationEntity) {
    const robotRepository = new RobotRepository(dataSource);
    await robotRepository.delete({
        name: entity.id,
        realm_id: entity.realm_id,
    });
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
