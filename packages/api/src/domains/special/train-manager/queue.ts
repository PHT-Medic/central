/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type {
    TrainManagerCommand,
    TrainManagerCommandPayload,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import type { RouterQueuePayload } from '../../../components';

type TrainManagerPayloadBuildContext<
    Component extends `${TrainManagerComponent}`,
    Command extends TrainManagerCommand<Component>,
> = {
    component: Component,
    command: Command,
    data: TrainManagerCommandPayload<Component, Command>,
};

export function buildTrainManagerPayload<
    Component extends `${TrainManagerComponent}`,
    Command extends TrainManagerCommand<Component>,
>(
    context: TrainManagerPayloadBuildContext<Component, Command>,
) : PublishOptionsExtended<RouterQueuePayload<TrainManagerCommandPayload<Component, Command>>> {
    return {
        exchange: {
            routingKey: 'tm.router',
        },
        content: {
            data: context.data,
            metadata: {
                component: context.component,
                command: context.command,
            },
        },
    };
}
