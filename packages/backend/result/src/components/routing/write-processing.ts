/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import { TrainManagerRoutingPayload, TrainManagerRoutingQueueEvent } from '@personalhealthtrain/central-common';
import { buildAPIQueueEventMessage } from '../../config/queue';

export async function writeProcessingEvent(message: Message) {
    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerRoutingQueueEvent.MOVE_STARTED,
        message.data as TrainManagerRoutingPayload,
    ));

    return message;
}
