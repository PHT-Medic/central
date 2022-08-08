/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProject,
    TrainManagerQueueCommand,
    TrainManagerQueuePayloadExtended,
    TrainManagerRoutingStartPayload,
    TrainManagerRoutingStep,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from 'hapic';
import { Client as HarborClient } from '@hapic/harbor';
import { buildSelfQueueCommandMessage } from '../../config';
import { RoutingError } from './error';
import { BuildingError } from '../building/error';
import { createBasicHarborAPIConfig } from '../../domains/harbor';

export async function processRouteStartCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerRoutingStartPayload>;

    if (!data.registry) {
        throw RoutingError.registryNotFound({
            step: TrainManagerRoutingStep.START,
        });
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborClient>(httpClientConfig);

    const client = useClient<HTTPClient>();

    let incomingProject : RegistryProject;

    try {
        incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);
    } catch (e) {
        throw BuildingError.registryProjectNotFound({
            step: TrainManagerRoutingStep.START,
            message: 'The train build registry-project was not found.',
        });
    }

    const harborRepository = await httpClient.projectRepository
        .find(incomingProject.external_name, data.id);

    if (
        !harborRepository ||
        harborRepository.artifact_count < 2
    ) {
        const queueMessage = buildSelfQueueCommandMessage(
            TrainManagerQueueCommand.BUILD,
            {
                id: data.id,
            },
        );

        await publishMessage(queueMessage);

        throw RoutingError.notFound({
            type: TrainManagerRoutingStep.START,
            message: 'The train does not exist in the incoming registry-project.',
        });
    }

    const routeMessage = buildSelfQueueCommandMessage(TrainManagerQueueCommand.ROUTE, {
        repositoryName: data.id,
        projectName: incomingProject.external_name,
        operator: data.registry.account_name,
        artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
    });

    await publishMessage(routeMessage);
}
