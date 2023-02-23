/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type {
    TrainManagerBuilderCheckPayload,
    TrainManagerBuilderCommand,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerBuilderEvent,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../utils';

export async function writeNoneEvent<T extends TrainManagerBuilderCheckPayload>(
    context: ComponentExecutionContext<TrainManagerBuilderCommand, T>,
) {
    await publish(buildAPIQueueMessage({
        event: TrainManagerBuilderEvent.NONE,
        command: context.command,
        component: TrainManagerComponent.BUILDER,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
