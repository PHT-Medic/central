/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type {
    TrainManagerExtractorCommand,

    TrainManagerExtractorPayload,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerExtractorEvent,
} from '@personalhealthtrain/central-common';
import type { QueueEventErrorContext } from '../type';
import { ExtractorError } from './error';
import { buildAPIQueueMessage } from '../utils';
import { BaseError } from '../error';

export async function writeFailedEvent(
    data: TrainManagerExtractorPayload<any>,
    context: QueueEventErrorContext<TrainManagerExtractorCommand>,
) {
    const extractingError = context.error instanceof ExtractorError || context.error instanceof BaseError ?
        context.error :
        new ExtractorError({ previous: context.error });

    await publish(buildAPIQueueMessage({
        event: TrainManagerExtractorEvent.FAILED,
        component: TrainManagerComponent.EXTRACTOR,
        command: context.command,
        data: {
            ...data,
            error: {
                code: extractingError.getCode(),
                message: extractingError.message,
                step: extractingError.getStep(),
            },
        },
    }));

    return data;
}
