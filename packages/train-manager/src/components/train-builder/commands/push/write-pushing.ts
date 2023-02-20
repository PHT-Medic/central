/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type {
    TrainManagerBuilderBuildPayload,
    TrainManagerBuilderCommand,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerBuilderEvent,

    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../../utils';
import type { QueueEventContext } from '../../../type';

export async function writePushingEvent(
    data: TrainManagerBuilderBuildPayload,
    context: QueueEventContext<TrainManagerBuilderCommand>,
) {
    await publish(buildAPIQueueMessage({
        event: TrainManagerBuilderEvent.PUSHING,
        command: context.command,
        component: TrainManagerComponent.BUILDER,
        data, //  { id: 'xxx' }
    }));

    return data;
}
