/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { CoreEvent } from '../constants';
import type { CoreDestroyCommandContext } from '../type';
import { buildCoreAggregatorQueuePayload } from '../utils';

export async function writeDestroyingEvent(
    context: CoreDestroyCommandContext,
) {
    await publish(buildCoreAggregatorQueuePayload({
        event: CoreEvent.DESTROYING,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
