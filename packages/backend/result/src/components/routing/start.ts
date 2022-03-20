/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainManagerQueueCommand,
    TrainManagerRoutingStartPayload,
} from '@personalhealthtrain/central-common';
import { buildSelfQueueMessage } from '../../config/queue';

export async function processStartCommand(message: Message) {
    const data = message.data as TrainManagerRoutingStartPayload;

    // todo check if build, else send building queue command

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
