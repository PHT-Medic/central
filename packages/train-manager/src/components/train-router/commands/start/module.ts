/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type {
    HTTPClient,
    RegistryProject,
    TrainManagerQueuePayloadExtended, TrainManagerRouterStartPayload,
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_LATEST,
    TrainManagerBuilderCommand,
    TrainManagerComponent,
    TrainManagerRouterCommand, buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from 'hapic';
import type { Client as HarborClient } from '@hapic/harbor';
import { buildCommandQueueMessageForSelf } from '../../../../config';
import { RouterError } from '../../error';
import { BuilderError } from '../../../train-builder';
import { createBasicHarborAPIConfig } from '../../../../domains/harbor';

export async function processStartCommand(
    data: TrainManagerQueuePayloadExtended<TrainManagerRouterStartPayload>,
) : Promise<TrainManagerQueuePayloadExtended<TrainManagerRouterStartPayload>> {
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
        await publish(buildCommandQueueMessageForSelf({
            command: TrainManagerBuilderCommand.BUILD,
            component: TrainManagerComponent.BUILDER,
            data: { id: data.id },
        }));

        return data;
    }

    await publish(buildCommandQueueMessageForSelf({
        command: TrainManagerRouterCommand.ROUTE,
        component: TrainManagerComponent.ROUTER,
        data: {
            repositoryName: data.id,
            projectName: incomingProject.external_name,
            operator: data.registry.account_name,
            artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
        },
    }));

    return data;
}
