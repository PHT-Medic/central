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
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_LATEST,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { BuilderCommand, BuilderError, buildBuilderQueuePayload } from '../../../builder';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { RouterError } from '../../error';
import { createBasicHarborAPIClient } from '../../../../core';
import type { RouterStartPayload } from '../../type';
import { RouterCommand } from '../../constants';
import { buildRouterQueuePayload, useRouterLogger } from '../../utils';

export async function executeRouterStartCommand(
    input: RouterStartPayload,
) : Promise<ComponentPayloadExtended<RouterStartPayload>> {
    useRouterLogger().debug('Executing command.', {
        command: RouterCommand.START,
    });

    const data = await extendPayload(input);
    if (!data.registry) {
        throw RouterError.registryNotFound();
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClient = createBasicHarborAPIClient(connectionString);

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
        await publish(buildBuilderQueuePayload({
            command: BuilderCommand.BUILD,
            data: { id: data.id },
        }));

        return data;
    }

    await publish(buildRouterQueuePayload({
        command: RouterCommand.ROUTE,
        data: {
            repositoryName: data.id,
            projectName: incomingProject.external_name,
            operator: data.registry.account_name,
            artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
        },
    }));

    return data;
}
