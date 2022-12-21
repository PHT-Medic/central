/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    hasOwnProperty,
} from '@personalhealthtrain/central-common';
import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueSelfRoutingKey, MessageQueueSelfToUIRoutingKey } from './services/rabbitmq';

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

export function buildCommandQueueMessageForSelf(
    command: string,
    data: Record<string, any>,
    metadata: Record<string, any>,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type: `${metadata.component}_${command}`,
        data,
        metadata: {
            ...metadata,
            command,
        },
    });
}

export function buildEventQueueMessageForAPI(
    event: string,
    data: Record<string, any>,
    metadata: Record<string, any>,
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: `${metadata.component}_${metadata.command}_${event}`,
        data: cleanupQueuePayload({ ...data }),
        metadata: {
            ...metadata,
            event,
        },
    });
}
