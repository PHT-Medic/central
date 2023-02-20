/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    hasOwnProperty,
} from '@personalhealthtrain/central-common';
import type { PublishOptionsExtended } from 'amqp-extension';
import { } from 'amqp-extension';
import type { RouterQueuePayload } from '../components/router';
import { ROUTER_QUEUE_ROUTING_KEY } from '../components/router';

export function cleanupQueuePayload<T extends Record<string, any>>(payload: T): T {
    if (hasOwnProperty(payload, 'entity')) {
        delete payload.entity;
    }

    if (hasOwnProperty(payload, 'registry')) {
        delete payload.registry;
    }

    if (hasOwnProperty(payload, 'registryProject')) {
        delete payload.registryProject;
    }

    return payload;
}

type QueueMessageContext = {
    command: string,
    component: string,
    event?: string,
    data: Record<string, any>,
};
export function buildCommandQueueMessageForSelf(
    context: QueueMessageContext,
) : PublishOptionsExtended<RouterQueuePayload<Record<string, any>>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                command: context.command,
                component: context.component,
                ...(context.event ? { event: context.event } : {}),
            },
        },
    };
}

export function buildEventQueueMessageForAPI(
    context : Omit<QueueMessageContext, 'event'> & { event: string },
) : PublishOptionsExtended<RouterQueuePayload<any>> {
    return {
        exchange: {
            routingKey: 'api.aggregator.tm',
        },
        content: {
            data: cleanupQueuePayload({ ...context.data }),
            metadata: {
                command: context.command,
                component: context.component,
                event: context.event,
            },
        },
    };
}
