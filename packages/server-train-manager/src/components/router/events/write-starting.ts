/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand } from '@personalhealthtrain/server-core';
import { publish } from 'amqp-extension';
import type { RouterCommand } from '../constants';
import { RouterEvent } from '../constants';
import type { RouterStartCommandContext } from '../type';
import { buildRouterAggregatorQueuePayload } from '../utils';

export async function writeStartingEvent(
    context: ComponentContextWithCommand<
    RouterStartCommandContext,
        `${RouterCommand.START}` | `${RouterCommand.CHECK}`
    >,
) {
    await publish(buildRouterAggregatorQueuePayload({
        event: RouterEvent.STARTING,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
