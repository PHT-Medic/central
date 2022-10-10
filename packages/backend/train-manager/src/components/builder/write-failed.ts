/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerBuilderEvent,
} from '@personalhealthtrain/central-common';
import { BuilderError } from './error';
import { buildEventQueueMessageForAPI } from '../../config';
import { BaseError } from '../error';

export async function writeFailedEvent(
    message: Message,
    error: Error,
) {
    const buildingError = error instanceof BuilderError || error instanceof BaseError ?
        error :
        new BuilderError({ previous: error });

    message.data = {
        ...message.data,
        error: {
            code: buildingError.getCode(),
            message: buildingError.message,
            step: buildingError.getStep(),
        },
    };

    await publishMessage(buildEventQueueMessageForAPI(
        TrainManagerBuilderEvent.FAILED,
        message.data,
        message.data,
    ));

    return message;
}
