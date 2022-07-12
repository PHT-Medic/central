/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import {
    TrainManagerCommand,
    TrainManagerCommandQueuePayload,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { MessageQueueRoutingKey } from '../../../config/mq';

export function buildTrainManagerQueueMessage<
    Component extends `${TrainManagerComponent}` | TrainManagerComponent,
    Command extends TrainManagerCommand<Component>,
>(
    component: Component,
    command: Command,
    data: TrainManagerCommandQueuePayload<Component, Command>,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.TRAIN_MANAGER_COMMAND,
        },
        type: `${component}_${command}`,
        data,
        metadata: {
            component,
            command,
        },
    });
}
