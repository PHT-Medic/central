/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { ExtractorEvent } from '../constants';
import type { ExtractorCheckCommandContext } from '../type';
import { buildExtractorAggregatorQueuePayload } from '../utils';

export async function writeCheckedEvent(
    context: ExtractorCheckCommandContext,
) {
    await publish(buildExtractorAggregatorQueuePayload({
        event: ExtractorEvent.CHECKING,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
