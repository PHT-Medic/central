/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type {
    TrainManagerBuilderBuildPayload,
    TrainManagerBuilderCommand,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerBuilderEvent,

    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../utils';

export async function writeBuiltEvent<T extends TrainManagerBuilderBuildPayload>(
    context: ComponentExecutionContext<TrainManagerBuilderCommand, T>,
) : Promise<T> {
    await publish(buildAPIQueueMessage({
        event: TrainManagerBuilderEvent.BUILT,
        command: context.command,
        component: TrainManagerComponent.BUILDER,
        data: context.data, //  { id: 'xxx' }
    }));

    return context.data;
}
