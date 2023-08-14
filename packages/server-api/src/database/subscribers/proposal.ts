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
    Proposal,
} from '@personalhealthtrain/core';
import {
    DomainEventName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@personalhealthtrain/core';
import { ProposalEntity } from '../../domains';

async function publishEvent(
    event: `${DomainEventName}`,
    data: Proposal,
) {
    await publishDomainEvent(
        {
            type: DomainType.PROPOSAL,
            event,
            data,
        },
        [
            {
                channel: (id) => buildDomainChannelName(DomainType.PROPOSAL, id),
                namespace: buildDomainNamespaceName(data.realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.PROPOSAL, id),
            },
        ],
    );
}

@EventSubscriber()
export class ProposalSubscriber implements EntitySubscriberInterface<ProposalEntity> {
    listenTo(): CallableFunction | string {
        return ProposalEntity;
    }

    async afterInsert(event: InsertEvent<ProposalEntity>): Promise<any> {
        await publishEvent(DomainEventName.CREATED, event.entity);
    }

    async afterUpdate(event: UpdateEvent<ProposalEntity>): Promise<any> {
        await publishEvent(DomainEventName.UPDATED, event.entity as ProposalEntity);
    }

    async beforeRemove(event: RemoveEvent<ProposalEntity>): Promise<any> {
        await publishEvent(DomainEventName.DELETED, event.entity);
    }
}
