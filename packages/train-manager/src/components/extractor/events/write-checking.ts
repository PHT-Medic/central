/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { publish } from 'amqp-extension';
import type { TrainManagerExtractorCheckQueuePayload, TrainManagerExtractorCommand } from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerExtractorEvent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../utils';

export async function writeCheckingEvent<T extends TrainManagerExtractorCheckQueuePayload>(
    context: ComponentExecutionContext<`${TrainManagerExtractorCommand}`, T >,
) {
    await publish(buildAPIQueueMessage({
        event: TrainManagerExtractorEvent.CHECKING,
        component: TrainManagerComponent.EXTRACTOR,
        command: context.command,
        data: context.data,
    }));

    return context.data;
}
