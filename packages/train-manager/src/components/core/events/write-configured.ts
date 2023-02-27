/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { CoreEvent } from '../constants';
import type { CoreConfigureCommandContext } from '../type';
import { buildCoreAggregatorQueuePayload } from '../utils';

export async function writeConfiguredEvent(
    context: CoreConfigureCommandContext,
) {
    await publish(buildCoreAggregatorQueuePayload({
        event: CoreEvent.CONFIGURED,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
