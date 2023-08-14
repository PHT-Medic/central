/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishDomainEvent } from '@personalhealthtrain/server-core';
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
    ProposalStation,
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { ProposalStationEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: ProposalStation,
) {
    await publishDomainEvent(
        {
            type: DomainType.PROPOSAL_STATION,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROPOSAL_STATION_IN, id),
                namespace: buildDomainNamespaceName(data.station_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROPOSAL_STATION_OUT, id),
                namespace: buildDomainNamespaceName(data.proposal_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.PROPOSAL_STATION, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROPOSAL_STATION_IN, id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROPOSAL_STATION_OUT, id),
            },
        ],
    );
}

@EventSubscriber()
export class ProposalStationSubscriber implements EntitySubscriberInterface<ProposalStationEntity> {
    listenTo(): CallableFunction | string {
        return ProposalStationEntity;
    }

    async afterInsert(event: InsertEvent<ProposalStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<ProposalStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as ProposalStationEntity);
    }

    async beforeRemove(event: RemoveEvent<ProposalStationEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
