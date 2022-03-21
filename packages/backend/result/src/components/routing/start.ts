/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    HTTPClientKey, HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainManagerQueueCommand,
    TrainManagerRoutingStartPayload, TrainManagerRoutingStep,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { buildSelfQueueMessage } from '../../config/queue';
import { RoutingError } from './error';

export async function processStartCommand(message: Message) {
    const data = message.data as TrainManagerRoutingStartPayload;

    const harborRepository = await useClient<HarborAPI>(HTTPClientKey.HARBOR).projectRepository
        .find(REGISTRY_INCOMING_PROJECT_NAME, data.id);

    if (
        !harborRepository ||
        harborRepository.artifactCount === 0
    ) {
        const queueMessage = buildSelfQueueMessage(
            TrainManagerQueueCommand.BUILD,
            {
                id: data.id,
            },
        );

        await publishMessage(queueMessage);

        throw RoutingError.trainNotFound(TrainManagerRoutingStep.START);
    }

    await publishMessage(buildSelfQueueMessage(TrainManagerQueueCommand.ROUTE, {
        repositoryName: data.id,
        projectName: REGISTRY_INCOMING_PROJECT_NAME,
        operator: REGISTRY_SYSTEM_USER_NAME,
        artifactTag: REGISTRY_ARTIFACT_TAG_BASE,
    }));

    await publishMessage(buildSelfQueueMessage(TrainManagerQueueCommand.ROUTE, {
        repositoryName: data.id,
        projectName: REGISTRY_INCOMING_PROJECT_NAME,
        operator: REGISTRY_SYSTEM_USER_NAME,
        artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
    }));
}
