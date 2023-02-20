/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type {
    TrainManagerCommand,
    TrainManagerCommandQueuePayload,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import type { RouterQueuePayload } from '../../../components';

export function buildTrainManagerQueueMessage<
    Component extends `${TrainManagerComponent}` | TrainManagerComponent,
    Command extends TrainManagerCommand<Component>,
>(
    component: Component,
    command: Command,
    data: TrainManagerCommandQueuePayload<Component, Command>,
) : PublishOptionsExtended<RouterQueuePayload<TrainManagerCommandQueuePayload<Component, Command>>> {
    return {
        exchange: {
            routingKey: 'tm.router',
        },
        content: {
            data,
            metadata: {
                component,
                command,
            },
        },
    };
}
