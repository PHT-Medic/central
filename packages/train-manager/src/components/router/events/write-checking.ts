/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type { TrainManagerRouterCommand, TrainManagerRouterStatusPayload } from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerRouterEvent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../utils';

export async function writeCheckingEvent<T extends TrainManagerRouterStatusPayload>(
    context: ComponentExecutionContext<`${TrainManagerRouterCommand}`, T>,
) {
    await publish(buildAPIQueueMessage({
        event: TrainManagerRouterEvent.CHECKING,
        component: TrainManagerComponent.ROUTER,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
