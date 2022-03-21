/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import {
    HarborAPI,
    REGISTRY_INCOMING_PROJECT_NAME,
    TrainManagerBuildPayload,
    TrainManagerBuildingQueueEvent,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function processBuildStatusEvent(message: Message) {
    const data = message.data as TrainManagerBuildPayload;

    const harborRepository = await useClient<HarborAPI>('harbor').projectRepository
        .find(REGISTRY_INCOMING_PROJECT_NAME, data.id);

    if (
        harborRepository &&
        harborRepository.artifactCount > 0
    ) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainManagerBuildingQueueEvent.FINISHED,
            data: message.data,
            metadata: message.metadata,
        }));

        return;
    }

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerBuildingQueueEvent.NONE,
        data: message.data,
        metadata: message.metadata,
    }));
}
