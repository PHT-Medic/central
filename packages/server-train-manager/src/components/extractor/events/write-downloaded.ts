/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand } from '@personalhealthtrain/server-core';
import { publish } from 'amqp-extension';
import type { ExtractorCommand } from '../constants';
import { ExtractorEvent } from '../constants';
import type { ExtractorExtractCommandContext } from '../type';
import { buildExtractorAggregatorQueuePayload } from '../utils';

export async function writeDownloadedEvent(
    context: ComponentContextWithCommand<ExtractorExtractCommandContext, `${ExtractorCommand}`>,
) {
    await publish(buildExtractorAggregatorQueuePayload({
        event: ExtractorEvent.DOWNLOADED,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
