/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentExecutionContext,
    ComponentExecutionErrorContext,
} from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type {
    TrainManagerExtractorCommand,

    TrainManagerExtractorPayload,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerExtractorEvent,
} from '@personalhealthtrain/central-common';
import { ExtractorError } from '../error';
import { buildAPIQueueMessage } from '../../utils';
import { BaseError } from '../../error';

export async function writeFailedEvent(
    context: ComponentExecutionErrorContext<`${TrainManagerExtractorCommand}`, TrainManagerExtractorPayload<any>>,
) {
    const error = context.error instanceof ExtractorError || context.error instanceof BaseError ?
        context.error :
        new ExtractorError({ previous: context.error });

    await publish(buildAPIQueueMessage({
        event: TrainManagerExtractorEvent.FAILED,
        component: TrainManagerComponent.EXTRACTOR,
        command: context.command,
        data: {
            ...context.data,
            error: {
                code: error.getCode(),
                message: error.message,
                step: error.getStep(),
            },
        },
    }));

    return context.data;
}
