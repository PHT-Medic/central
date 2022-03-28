/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import {
    TrainManagerQueueCommand,
    TrainManagerQueueCommandPayload,
} from '@personalhealthtrain/central-common';
import { MessageQueueRoutingKey } from '../../../config/mq';

export function buildTrainManagerQueueMessage<T extends `${TrainManagerQueueCommand}`>(
    command: T,
    data: TrainManagerQueueCommandPayload<T>,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.TRAIN_MANAGER_COMMAND,
        },
        type: command,
        data,
    });
}
