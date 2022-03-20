/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerExtractingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeDownloadingEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerExtractingQueueEvent.DOWNLOADING,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
