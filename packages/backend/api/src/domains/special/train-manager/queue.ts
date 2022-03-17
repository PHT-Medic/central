/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { TrainManagerExtractingQueuePayload, TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { MessageQueueRoutingKey } from '../../../config/mq';

export function buildTrainManagerQueueMessage(
    command: TrainManagerQueueCommand,
    data: TrainManagerExtractingQueuePayload,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.TRAIN_MANAGER_COMMAND,
        },
        type: command,
        data,
    });
}
