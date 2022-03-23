/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    HTTPClient,
    HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProject,
    TrainManagerQueueCommand,
    TrainManagerRoutingStartPayload, TrainManagerRoutingStep, buildConnectionStringFromRegistry, createBasicHarborAPIConfig,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { buildSelfQueueMessage } from '../../config/queue';
import { RoutingError } from './error';
import { BuildingError } from '../building/error';

export async function processStartCommand(message: Message) {
    const data = message.data as TrainManagerRoutingStartPayload;

    if (!data.registry) {
        throw RoutingError.registryNotFound();
    }

    const connectionString = buildConnectionStringFromRegistry(data.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    const client = useClient<HTTPClient>();

    let incomingProject : RegistryProject;

    try {
        incomingProject = await client.registryProject.getOne(data.entity.build_registry_project_id);
    } catch (e) {
        throw BuildingError.registryProjectNotFound();
    }

    const harborRepository = await httpClient.projectRepository
        .find(incomingProject.external_name, data.id);

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

        throw RoutingError.notFound({
            type: TrainManagerRoutingStep.START,
        });
    }

    const artifacts : string[] = [
        REGISTRY_ARTIFACT_TAG_BASE,
        REGISTRY_ARTIFACT_TAG_LATEST,
    ];

    for (let i = 0; artifacts.length; i++) {
        await publishMessage(buildSelfQueueMessage(TrainManagerQueueCommand.ROUTE, {
            repositoryName: data.id,
            projectName: incomingProject.external_name,
            operator: data.registry.account_name,
            artifactTag: artifacts[i],
        }));
    }
}
