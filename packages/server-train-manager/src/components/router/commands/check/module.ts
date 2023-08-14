/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseLongProjectRepositoryName } from '@hapic/harbor';
import type {
    APIClient,
    RegistryProject,
} from '@personalhealthtrain/core';
import {
    RegistryProjectType,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/core';
import { isClientErrorWithStatusCode, useClient } from 'hapic';
import { createBasicHarborAPIClient } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { RouterCommand } from '../../constants';
import { RouterError } from '../../error';
import { writePositionFoundEvent, writePositionNotFoundEvent } from '../../events';
import type { RouterCheckPayload } from '../../type';
import { useRouterLogger } from '../../utils';

export async function executeRouterCheckCommand(
    input: RouterCheckPayload,
) : Promise<ComponentPayloadExtended<RouterCheckPayload>> {
    useRouterLogger().debug('Executing command.', {
        command: RouterCommand.CHECK,
    });

    const data = await extendPayload(input);
    if (!data.registry) {
        throw RouterError.registryNotFound();
    }

    const client = useClient<APIClient>();

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClient = createBasicHarborAPIClient(connectionString);

    // -------------------------------------------------------------------------------

    let project : RegistryProject;

    try {
        project = await client.registryProject.getOne(data.entity.incoming_registry_project_id);
    } catch (e) {
        throw RouterError.registryProjectNotFound({
            message: `The train ${RegistryProjectType.INCOMING} registry-project was not found.`,
            previous: e,
        });
    }

    try {
        const harborRepository = await httpClient.projectRepository
            .getOne({ projectName: project.external_name, repositoryName: data.id });

        if (harborRepository && harborRepository.artifact_count > 0) {
            await writePositionFoundEvent({
                command: RouterCommand.CHECK,
                data: {
                    artifactTag: null,
                    operator: null,
                    projectName: harborRepository.project_name,
                    repositoryName: harborRepository.name_short,
                },
            });

            return data;
        }
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
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
        const httpClient = createBasicHarborAPIClient(connectionString);

        const searchResult = await httpClient.search(data.id);
        if (searchResult.repository.length > 0) {
            const repository = searchResult.repository.shift();

            if (
                repository.artifact_count >= 2 &&
                typeof repository.repository_name === 'string'
            ) {
                const parsed = parseLongProjectRepositoryName(repository.repository_name);

                await writePositionFoundEvent(
                    {
                        command: RouterCommand.CHECK,
                        data: {
                            artifactTag: null,
                            operator: null,
                            projectName: parsed.projectName,
                            repositoryName: parsed.repositoryName,
                        },
                    },
                );
            }

            return data;
        }
    }

    // -------------------------------------------------------------------------------

    if (data.entity.outgoing_registry_project_id) {
        try {
            project = await client.registryProject.getOne(data.entity.outgoing_registry_project_id);
        } catch (e) {
            throw RouterError.registryProjectNotFound({
                message: `The train ${RegistryProjectType.OUTGOING} registry-project was not found.`,
                previous: e,
            });
        }

        try {
            const harborRepository = await httpClient.projectRepository
                .getOne({ projectName: project.external_name, repositoryName: data.id });

            if (harborRepository && harborRepository.artifact_count > 0) {
                await writePositionFoundEvent({
                    command: RouterCommand.CHECK,
                    data: {
                        artifactTag: null,
                        operator: null,
                        projectName: harborRepository.project_name,
                        repositoryName: harborRepository.name_short,
                    },
                });

                return data;
            }
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }
    }

    // -------------------------------------------------------------------------------

    await writePositionNotFoundEvent({
        command: RouterCommand.CHECK,
        data: {
            artifactTag: null,
            operator: null,
            projectName: null,
            repositoryName: data.id,
        },
    });

    return data;
}
