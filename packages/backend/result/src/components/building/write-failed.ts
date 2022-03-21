/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerBuildingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { BuildingError } from './error';

export async function writeFailedEvent(message: Message, error: Error) {
    const buildingError = error instanceof BuildingError ?
        error :
        new BuildingError({ previous: error });

    const queueMessage = buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerBuildingQueueEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: buildingError.message,
                step: buildingError.getStep(),
                type: buildingError.getType(),
            },
        },
        metadata: message.metadata,
    });

    await publishMessage(queueMessage);

    return message;
}
