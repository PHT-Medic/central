/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerExtractingQueueEvent,
    TrainManagerExtractingQueuePayload, TrainManagerQueueEventPayloadExtended,
} from '@personalhealthtrain/central-common';
import { ExtractingError } from './error';
import { buildAPIQueueEventMessage } from '../../config/queue';

export async function writeFailedEvent(message: Message, error: Error) {
    const extractingError = error instanceof ExtractingError ?
        error :
        new ExtractingError({ previous: error });

    const payload : TrainManagerQueueEventPayloadExtended<TrainManagerExtractingQueueEvent.FAILED> = {
        ...message.data as TrainManagerExtractingQueuePayload,
        error: {
            message: extractingError.message,
            step: extractingError.getStep(),
            code: extractingError.getType(),
        },
    };

    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerExtractingQueueEvent.FAILED,
        payload,
    ));

    return message;
}
