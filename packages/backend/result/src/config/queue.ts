/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerBuildingQueueEvent,
    TrainManagerExtractingQueueEvent,
    TrainManagerQueueCommand,
    TrainManagerQueueCommandPayload,
    TrainManagerQueueEventPayload,
    TrainManagerQueueEventPayloadExtended,
    TrainManagerRoutingPayload,
    TrainManagerRoutingQueueEvent,
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

export function buildSelfQueueCommandMessage<
    T extends `${TrainManagerQueueCommand}`,
>(
    command: T,
    data: TrainManagerQueueCommandPayload<T>,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type: command,
        data,
    });
}

export function buildAPIQueueEventMessage<
    T extends `${TrainManagerRoutingQueueEvent}` |
        `${TrainManagerBuildingQueueEvent}` |
        `${TrainManagerExtractingQueueEvent}`,
>(
    command: T,
    data: TrainManagerQueueEventPayloadExtended<T>,
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: command,
        data: cleanupQueuePayload({ ...data }),
    });
}
