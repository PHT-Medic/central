/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import {
    TrainManagerBuildPayload,
    TrainManagerBuildingQueueEvent,
    TrainManagerQueueEventPayload, TrainManagerQueueEventPayloadExtended,
} from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { BuildingError } from './error';
import { BaseError } from '../error';
import { buildAPIQueueEventMessage } from '../../config/queue';

export async function writeFailedEvent(message: Message, error: Error) {
    const buildingError = error instanceof BuildingError ?
        error :
        new BuildingError({ previous: error });

    const payload : TrainManagerQueueEventPayloadExtended<TrainManagerBuildingQueueEvent.FAILED> = {
        ...message.data as TrainManagerBuildPayload,
        error: {
            message: buildingError.message,
            step: buildingError.getStep(),
            code: buildingError.getType(),
        },
    };

    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerBuildingQueueEvent.FAILED,
        payload,
    ));

    return message;
}
