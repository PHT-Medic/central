/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    APIClient,
} from '@personalhealthtrain/core';
import {
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/core';

import { isClientErrorWithStatusCode, useClient } from 'hapic';
import { createBasicHarborAPIClient } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderCommand } from '../../constants';
import { BuilderError } from '../../error';
import { writeBuiltEvent, writeNoneEvent } from '../../events';
import type { BuilderCheckPayload } from '../../type';

export async function executeBuilderCheckCommand(
    input: BuilderCheckPayload,
) : Promise<ComponentPayloadExtended<BuilderCheckPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        await writeNoneEvent({
            command: BuilderCommand.CHECK,
            data,
        });

        return data;
    }

    // -----------------------------------------------------------------------------------

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClient = createBasicHarborAPIClient(connectionString);

    const client = useClient<APIClient>();
    const incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);

    try {
        const harborRepository = await httpClient.projectRepository
            .getOne({ projectName: incomingProject.external_name, repositoryName: data.id });

        if (
            harborRepository &&
            harborRepository.artifact_count > 0
        ) {
            await writeBuiltEvent({
                data,
                command: BuilderCommand.CHECK,
            });

            return data;
        }
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    await writeNoneEvent({
        command: BuilderCommand.CHECK,
        data,
    });

    return data;
}
