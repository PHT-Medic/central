/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type { TrainManagerExtractorCommand, TrainManagerExtractorPayload } from '@personalhealthtrain/central-common';
import {
    TrainManagerComponent,
    TrainManagerExtractorEvent,
} from '@personalhealthtrain/central-common';
import { buildAPIQueueMessage } from '../../../utils';
import type { QueueEventContext } from '../../../type';

export async function writeDownloadedEvent(
    data: TrainManagerExtractorPayload<any>,
    context: QueueEventContext<TrainManagerExtractorCommand>,
) {
    await publish(buildAPIQueueMessage({
        event: TrainManagerExtractorEvent.DOWNLOADED,
        component: TrainManagerComponent.EXTRACTOR,
        command: context.command,
        data,
    }));

    return data;
}
