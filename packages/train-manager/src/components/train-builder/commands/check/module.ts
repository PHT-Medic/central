/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as HarborClient } from '@hapic/harbor';
import type {
    HTTPClient,
    TrainManagerBuilderBuildPayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import {
    TrainManagerBuilderCommand,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';

import { createClient, useClient } from 'hapic';
import { createBasicHarborAPIConfig } from '../../../../domains/harbor';
import { BuilderError } from '../../error';
import { writeBuiltEvent } from '../build';
import { writeNoneEvent } from './write-none';

export async function processCheckCommand(
    data: TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>,
) : Promise<TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>> {
    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        await writeNoneEvent(data, {
            command: TrainManagerBuilderCommand.CHECK,
        });

        return data;
    }

    // -----------------------------------------------------------------------------------

    const connectionString = buildRegistryClientConnectionStringFromRegistry(data.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborClient>(httpClientConfig);

    const client = useClient<HTTPClient>();
    const incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);

    const harborRepository = await httpClient.projectRepository
        .find(incomingProject.external_name, data.id);

    if (
        harborRepository &&
        harborRepository.artifact_count > 0
    ) {
        await writeBuiltEvent(data, {
            command: TrainManagerBuilderCommand.CHECK,
        });

        return data;
    }

    await writeNoneEvent(data, {
        command: TrainManagerBuilderCommand.CHECK,
    });

    return data;
}
