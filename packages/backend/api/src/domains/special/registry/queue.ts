/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../../config/mq';
import { RegistryEventQueuePayload, RegistryQueuePayload } from './type';
import { RegistryQueueCommand, RegistryQueueEvent } from './constants';

export function buildRegistryEventQueueMessage(
    type: `${RegistryQueueEvent}`,
    data: RegistryEventQueuePayload,
    metaData: Record<string, any> = {},
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.EVENT,
        },
        type,
        data,
        metadata: metaData,
    });
}

export function buildRegistryQueueMessage<T extends `${RegistryQueueCommand}`>(
    command: T,
    data?: RegistryQueuePayload<T>,
    metaData: Record<string, any> = {},
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.COMMAND,
        },
        type: command,
        data: data || {},
        metadata: metaData,
    });
}
