/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerRoutingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { RoutingError } from './error';

export async function writeFailedEvent(message: Message, error: Error) {
    const routingError = error instanceof RoutingError ?
        error :
        new RoutingError({ previous: error });

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerRoutingQueueEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: routingError.message,
                step: routingError.getStep(),
                type: routingError.getType(),
            },
        },
        metadata: message.metadata,
    }));

    return message;
}
