/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerRoutingPayload,
    TrainManagerRoutingQueueEvent,
} from '@personalhealthtrain/central-common';
import { RoutingError } from './error';
import { buildAPIQueueEventMessage } from '../../config/queue';

export async function writeFailedEvent(message: Message, error: Error) {
    console.log(error);

    const routingError = error instanceof RoutingError ?
        error :
        new RoutingError({ previous: error });

    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerRoutingQueueEvent.FAILED,
        {
            ...message.data as TrainManagerRoutingPayload,
            error: {
                message: routingError.message,
                step: routingError.getStep(),
                code: routingError.getCode(),
            },
        },
    ));

    return message;
}
