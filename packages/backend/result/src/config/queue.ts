/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerQueueCommand, TrainManagerQueuePayload } from '@personalhealthtrain/central-common';
import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from './services/rabbitmq';

export function buildSelfQueueMessage<T extends `${TrainManagerQueueCommand}`>(
    command: T,
    data: TrainManagerQueuePayload<T>,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type: command,
        data,
    });
}
