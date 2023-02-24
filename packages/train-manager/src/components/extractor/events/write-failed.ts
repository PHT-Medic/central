/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentExecutionErrorContext,
} from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import { Component } from '../../constants';
import { ExtractorError } from '../error';
import { buildAPIQueueMessage } from '../../utils';
import { BaseError } from '../../error';
import type { ExtractorCommand } from '../constants';
import { ExtractorEvent } from '../constants';
import type { ExtractorPayload } from '../type';

export async function writeFailedEvent(
    context: ComponentExecutionErrorContext<`${ExtractorCommand}`, ExtractorPayload<any>>,
) {
    const error = context.error instanceof ExtractorError || context.error instanceof BaseError ?
        context.error :
        new ExtractorError({ previous: context.error });

    await publish(buildAPIQueueMessage({
        event: ExtractorEvent.FAILED,
        component: Component.EXTRACTOR,
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
