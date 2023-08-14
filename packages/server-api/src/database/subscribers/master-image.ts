/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/server-core';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    MasterImage,
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
} from '@personalhealthtrain/core';
import { MasterImageEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: MasterImage,
) {
    await publishDomainEvent(
        {
            type: DomainType.MASTER_IMAGE,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.MASTER_IMAGE, id),
            },
        ],
    );
}

@EventSubscriber()
export class MasterImageSubscriber implements EntitySubscriberInterface<MasterImageEntity> {
    listenTo(): CallableFunction | string {
        return MasterImageEntity;
    }

    async afterInsert(event: InsertEvent<MasterImageEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<MasterImageEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as MasterImageEntity);
    }

    async beforeRemove(event: RemoveEvent<MasterImageEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
