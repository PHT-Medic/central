/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainQueueCommand, TrainQueuePayload } from '@personalhealthtrain/central-common';
import type { PublishOptionsExtended } from 'amqp-extension';
import type { RouterQueuePayload } from '../../../components';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';

export function buildTrainQueueMessage(
    type: TrainQueueCommand,
    data: TrainQueuePayload<any>,
) : PublishOptionsExtended<RouterQueuePayload<TrainQueuePayload<any>>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data,
            metadata: {
                component: ComponentName.TRAIN,
                command: type,
            },
        },
    };
}
