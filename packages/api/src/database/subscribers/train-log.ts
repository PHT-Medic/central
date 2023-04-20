/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/central-server-common';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import type {
    TrainLog,
} from '@personalhealthtrain/central-common';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/central-common';
import { TrainLogEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: TrainLog,
) {
    await publishDomainEvent(
        {
            type: DomainType.TRAIN_LOG,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.TRAIN_LOG, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.TRAIN_LOG, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
        ],
    );
}

@EventSubscriber()
export class TrainLogSubscriber implements EntitySubscriberInterface<TrainLogEntity> {
    listenTo(): CallableFunction | string {
        return TrainLogEntity;
    }

    async afterInsert(event: InsertEvent<TrainLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<TrainLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as TrainLogEntity);
    }

    async beforeRemove(event: RemoveEvent<TrainLogEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
