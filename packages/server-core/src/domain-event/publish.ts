/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainsEventContext } from '@personalhealthtrain/core';
import { publishDomainRedisEvent } from './redis';
import { publishDomainSocketEvent } from './socket';
import type { DomainEventDestinations } from './type';

export async function publishDomainEvent(
    context: DomainsEventContext,
    destinations: DomainEventDestinations,
) {
    await publishDomainRedisEvent(context, destinations);
    publishDomainSocketEvent(context, destinations);
}
