/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { TrainExtractorQueuePayload } from '@personalhealthtrain/central-common';
import { MessageQueueRoutingKey } from '../../../config/mq';
import { TrainExtractorQueueCommand } from './constants';

export function buildTrainExtractorQueueMessage(
    command: TrainExtractorQueueCommand,
    data: TrainExtractorQueuePayload,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.RESULT_SERVICE_COMMAND,
        },
        type: command,
        data,
    });
}
