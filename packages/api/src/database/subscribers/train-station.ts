/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/central-server-common';
import type {
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import {
    EventSubscriber,
} from 'typeorm';
import type {
    TrainStation,
} from '@personalhealthtrain/central-common';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/central-common';
import { TrainStationEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: TrainStation,
) {
    await publishDomainEvent(
        {
            type: DomainType.TRAIN_STATION,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainSubType.TRAIN_STATION_IN, id),
                namespace: buildDomainNamespaceName(data.station_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT, id),
                namespace: buildDomainNamespaceName(data.train_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.TRAIN_STATION, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.TRAIN_STATION_IN, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT, id),
            },
        ],
    );
}

@EventSubscriber()
export class TrainStationSubscriber implements EntitySubscriberInterface<TrainStationEntity> {
    listenTo(): CallableFunction | string {
        return TrainStationEntity;
    }

    async afterInsert(event: InsertEvent<TrainStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<TrainStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as TrainStationEntity);
    }

    async beforeRemove(event: RemoveEvent<TrainStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
