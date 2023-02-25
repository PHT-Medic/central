/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithCommand, ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type { RouterCommand } from '../constants';
import { RouterEvent } from '../constants';
import type { RouterCommandContext } from '../type';
import { buildRouterAggregatorQueuePayload } from '../utils';

export async function writeFailedEvent(
    context: ComponentContextWithCommand<
    ComponentContextWithError<RouterCommandContext>,
        `${RouterCommand}`
    >,
) {
    await publish(buildRouterAggregatorQueuePayload({
        event: RouterEvent.FAILED,
        command: context.command,
        data: context.data,
        error: context.error,
    }));
}
