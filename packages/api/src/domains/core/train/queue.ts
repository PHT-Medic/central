/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type { QueueRouterPayload, TrainPayload } from '../../../components';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';
import type { TrainCommand } from '../../../components/train/constants';

export function buildTrainQueueMessage(
    type: TrainCommand,
    data: TrainPayload<any>,
) : PublishOptionsExtended<QueueRouterPayload<TrainPayload<any>>> {
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
