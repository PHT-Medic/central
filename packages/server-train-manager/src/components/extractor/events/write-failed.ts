/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@personalhealthtrain/server-core';
import { publish } from 'amqp-extension';
import { ExtractorEvent } from '../constants';
import type { ExtractorCommandContext } from '../type';
import { buildExtractorAggregatorQueuePayload } from '../utils';

export async function writeFailedEvent(
    context: ComponentContextWithError<ExtractorCommandContext>,
) {
    await publish(buildExtractorAggregatorQueuePayload({
        event: ExtractorEvent.FAILED,
        command: context.command,
        data: context.data,
        error: context.error,
    }));

    return context.data;
}
