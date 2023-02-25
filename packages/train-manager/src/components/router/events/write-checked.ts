/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import { RouterEvent } from '../constants';
import type { RouterCheckCommandContext } from '../type';
import { buildRouterAggregatorQueuePayload } from '../utils';

export async function writeCheckedEvent(
    context: RouterCheckCommandContext,
) {
    await publish(buildRouterAggregatorQueuePayload({
        event: RouterEvent.CHECKED,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
