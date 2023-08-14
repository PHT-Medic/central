/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventName, DomainEventSubscriptionName,
} from './constants';
import type { DomainEventFullName, DomainEventSubscriptionFullName, DomainInput } from './types';

export function buildDomainEventFullName<T extends DomainInput>(
    type: T,
    event: `${DomainEventName}` | DomainEventName,
) : DomainEventFullName<T> {
    const eventCapitalized = event.substring(0, 1).toUpperCase() + event.substring(1);

    return type + eventCapitalized as DomainEventFullName<T>;
}

export function buildDomainEventSubscriptionFullName<
    T extends DomainInput,
>(
    type: T,
    event: `${DomainEventSubscriptionName}` | DomainEventSubscriptionName,
) : DomainEventSubscriptionFullName<T> {
    const eventCapitalized = event.substring(0, 1).toUpperCase() + event.substring(1);

    return type + eventCapitalized as DomainEventSubscriptionFullName<T>;
}

export function buildDomainChannelName(type: DomainInput, id?: string | number) {
    return `${type}${id ? `:${id}` : ''}`;
}

export function buildDomainNamespaceName(id: string) {
    return `/realm#${id}`;
}
