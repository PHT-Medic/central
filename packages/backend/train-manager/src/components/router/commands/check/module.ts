/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    RegistryProject,
    RegistryProjectType,
    TrainManagerQueuePayloadExtended,
    TrainManagerRouterCommand,
    TrainManagerRouterStatusPayload,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { HarborClient, parseProjectRepositoryName } from '@trapi/harbor-client';
import { RouterError } from '../../error';
import { BuilderError } from '../../../builder/error';
import { createBasicHarborAPIConfig } from '../../../../domains/harbor';
import { writePositionFoundEvent } from './write-position-found';
import { writePositionNotFoundEvent } from './write-position-not-found';

export async function processCheckCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerRouterStatusPayload>;

    if (!data.registry) {
        throw RouterError.registryNotFound();
    }

    const client = useClient<HTTPClient>();

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborClient>(httpClientConfig);

    // -------------------------------------------------------------------------------

    const specialProjects : {
        type: `${RegistryProjectType.INCOMING}` | `${RegistryProjectType.OUTGOING}`
        id: RegistryProject['id']
    }[] = [
        { type: RegistryProjectType.INCOMING, id: data.entity.incoming_registry_project_id },
        { type: RegistryProjectType.OUTGOING, id: data.entity.outgoing_registry_project_id },
    ];

    for (let i = 0; i < specialProjects.length; i++) {
        let project : RegistryProject;

        try {
            project = await client.registryProject.getOne(specialProjects[i].id);
        } catch (e) {
            throw BuilderError.registryProjectNotFound({
                message: `The train ${specialProjects[i].type} registry-project was not found.`,
            });
        }

        const harborRepository = await httpClient.projectRepository
            .find(project.external_name, data.id);

        if (
            harborRepository &&
            harborRepository.artifact_count > 0
        ) {
            message.data = {
                artifactTag: null,
                operator: null,
                projectName: harborRepository.project_name,
                repositoryName: harborRepository.name_slim,
            };

            await writePositionFoundEvent(message);

            return message;
        }
    }

    // -------------------------------------------------------------------------------

    const { data: registries } = await client.registry.getMany({
        fields: ['+account_secret'],
    });

    if (registries.length === 0) {
        throw RouterError.routeEmpty();
    }

    for (let i = 0; i < registries.length; i++) {
        const connectionString = buildRegistryClientConnectionStringFromRegistry(registries[i]);
        const httpClientConfig = createBasicHarborAPIConfig(connectionString);
        const httpClient = createClient<HarborClient>(httpClientConfig);

        const searchResult = await httpClient.search(data.id);
        if (searchResult.repository.length > 0) {
            if (searchResult.repository[0].artifact_count >= 2) {
                const parsed = parseProjectRepositoryName(searchResult.repository[0].repository_name);

                message.data = {
                    artifactTag: null,
                    operator: null,
                    projectName: parsed.project_name,
                    repositoryName: parsed.repository_name,
                };

                await writePositionFoundEvent(message);

                return message;
            }
        }
    }

    message.data = {
        artifactTag: null,
        operator: null,
        projectName: null,
        repositoryName: data.id,
    };

    await writePositionNotFoundEvent(message);

    return message;
}
