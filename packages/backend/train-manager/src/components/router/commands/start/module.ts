/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProject,
    TrainManagerBuilderCommand,
    TrainManagerComponent,
    TrainManagerQueuePayloadExtended,
    TrainManagerRouterCommand, TrainManagerRouterStartPayload, buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { HarborClient } from '@trapi/harbor-client';
import { buildCommandQueueMessageForSelf } from '../../../../config/queue';
import { RouterError } from '../../error';
import { BuilderError } from '../../../builder/error';
import { createBasicHarborAPIConfig } from '../../../../domains/harbor';

export async function processStartCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerRouterStartPayload>;

    if (!data.registry) {
        throw RouterError.registryNotFound();
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborClient>(httpClientConfig);

    const client = useClient<HTTPClient>();

    let incomingProject : RegistryProject;

    try {
        incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);
    } catch (e) {
        throw BuilderError.registryProjectNotFound({
            message: 'The train build registry-project was not found.',
        });
    }

    const harborRepository = await httpClient.projectRepository
        .find(incomingProject.external_name, data.id);

    if (
        !harborRepository ||
        harborRepository.artifact_count < 2
    ) {
        const buildMessage = buildCommandQueueMessageForSelf(
            TrainManagerBuilderCommand.BUILD,
            {
                id: data.id,
            },
            {
                ...message.metadata,
                component: TrainManagerComponent.BUILDER,
            },
        );

        await publishMessage(buildMessage);

        return message;
    }

    const routeMessage = buildCommandQueueMessageForSelf(
        TrainManagerRouterCommand.ROUTE,
        {
            repositoryName: data.id,
            projectName: incomingProject.external_name,
            operator: data.registry.account_name,
            artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
        },
        {
            ...message.metadata,
            component: TrainManagerComponent.ROUTER,
        },
    );

    await publishMessage(routeMessage);

    return message;
}
