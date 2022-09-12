/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerRouterEvent,
    TrainManagerRouterRoutePayload,
} from '@personalhealthtrain/central-common';
import { RouterError } from './error';
import { buildEventQueueMessageForAPI } from '../../config/queue';
import { BaseError } from '../error';

export async function writeFailedEvent(message: Message, error: Error) {
    const routingError = error instanceof RouterError || error instanceof BaseError ?
        error :
        new RouterError({ previous: error });

    message.data = {
        ...message.data as TrainManagerRouterRoutePayload,
        error: {
            code: routingError.getCode(),
            message: routingError.message,
            step: routingError.getStep(),
        },
    };

    await publishMessage(buildEventQueueMessageForAPI(
        TrainManagerRouterEvent.FAILED,
        message.data,
        message.metadata,
    ));

    return message;
}
