/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Station } from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainType,
    Ecosystem,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { publishDomainEvent } from '@personalhealthtrain/server-core';
import type {
    DataSource,
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { useAuthupClient } from '../../core';
import { StationEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Station,
) {
    await publishDomainEvent(
        {
            type: DomainType.STATION,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.STATION, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.STATION, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
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

    async afterInsert(event: InsertEvent<StationEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            await createRobot(event.connection, event.entity);
        }
    }

    async afterUpdate(event: UpdateEvent<StationEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as StationEntity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            await createRobot(event.connection, event.entity as StationEntity);
        }
    }

    async beforeRemove(event: RemoveEvent<StationEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);

        if (event.entity.ecosystem === Ecosystem.DEFAULT) {
            await deleteRobot(event.connection, event.entity);
        }
    }
}
