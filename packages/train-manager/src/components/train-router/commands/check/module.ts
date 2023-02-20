/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as HarborClient } from '@hapic/harbor';
import { parseProjectRepositoryName } from '@hapic/harbor';
import type {
    HTTPClient,
    RegistryProject,
    TrainManagerQueuePayloadExtended,
    TrainManagerRouterStatusPayload,
} from '@personalhealthtrain/central-common';
import {
    RegistryProjectType,
    TrainManagerRouterCommand,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from 'hapic';
import { createBasicHarborAPIConfig } from '../../../../core/harbor';
import { RouterError } from '../../error';
import { writePositionFoundEvent } from './write-position-found';
import { writePositionNotFoundEvent } from './write-position-not-found';

export async function processCheckCommand(
    data: TrainManagerQueuePayloadExtended<TrainManagerRouterStatusPayload>,
) : Promise<TrainManagerQueuePayloadExtended<TrainManagerRouterStatusPayload>> {
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
            throw RouterError.registryProjectNotFound({
                message: `The train ${specialProjects[i].type} registry-project was not found.`,
                previous: e,
            });
        }

        const harborRepository = await httpClient.projectRepository
            .find(project.external_name, data.id);

        if (
            harborRepository &&
            harborRepository.artifact_count > 0
        ) {
            await writePositionFoundEvent({
                artifactTag: null,
                operator: null,
                projectName: harborRepository.project_name,
                repositoryName: harborRepository.name_slim,
            }, {
                command: TrainManagerRouterCommand.CHECK,
            });

            return data;
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

                await writePositionFoundEvent(
                    {
                        artifactTag: null,
                        operator: null,
                        projectName: parsed.project_name,
                        repositoryName: parsed.repository_name,
                    },
                    {
                        command: TrainManagerRouterCommand.CHECK,
                    },
                );

                return data;
            }
        }
    }

    await writePositionNotFoundEvent({
        artifactTag: null,
        operator: null,
        projectName: null,
        repositoryName: data.id,
    }, {
        command: TrainManagerRouterCommand.CHECK,
    });

    return data;
}
