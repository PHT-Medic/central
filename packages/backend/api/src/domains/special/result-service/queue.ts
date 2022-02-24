/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { Train, TrainResult } from '@personalhealthtrain/central-common';
import { MessageQueueRoutingKey } from '../../../config/mq';

export enum ResultServiceCommand {
    START = 'start',
    STOP = 'stop',
    STATUS = 'status',
}

export type ResultServiceDataPayload = {
    id?: TrainResult['id'],
    train_id: Train['id'],
    latest?: boolean
};

export function buildResultServiceQueueMessage(
    command: ResultServiceCommand,
    data: ResultServiceDataPayload,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.RESULT_SERVICE_COMMAND,
        },
        type: command,
        data,
    });
}
