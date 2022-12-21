/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    TrainManagerExtractorEvent,
    TrainManagerExtractorExtractQueuePayload,
} from '@personalhealthtrain/central-common';
import { ExtractorError } from './error';
import { buildEventQueueMessageForAPI } from '../../config/queue';
import { BaseError } from '../error';

export async function writeFailedEvent(message: Message, error: Error) {
    const extractingError = error instanceof ExtractorError || error instanceof BaseError ?
        error :
        new ExtractorError({ previous: error });

    message.data = {
        ...message.data as TrainManagerExtractorExtractQueuePayload,
        error: {
            code: extractingError.getCode(),
            message: extractingError.message,
            step: extractingError.getStep(),
        },
    };

    await publishMessage(buildEventQueueMessageForAPI(
        TrainManagerExtractorEvent.FAILED,
        message.data,
        message.metadata,
    ));

    return message;
}
