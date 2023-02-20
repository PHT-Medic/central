/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type { TrainManagerBuilderBuildPayload, TrainManagerBuilderCommand } from '@personalhealthtrain/central-common';
import {
    TrainManagerBuilderEvent,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { buildEventQueueMessageForAPI } from '../../../../config';
import type { QueueEventContext } from '../../../type';

export async function writeNoneEvent(
    data: TrainManagerBuilderBuildPayload,
    context: QueueEventContext<TrainManagerBuilderCommand>,
) {
    await publish(buildEventQueueMessageForAPI({
        event: TrainManagerBuilderEvent.NONE,
        command: context.command,
        component: TrainManagerComponent.BUILDER,
        data, //  { id: 'xxx' }
    }));

    return data;
}
