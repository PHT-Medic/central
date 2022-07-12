/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    TrainManagerBuilderBuildPayload,
    TrainManagerQueuePayloadExtended,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { HarborClient } from '@trapi/harbor-client';
import { BuilderError } from '../../error';
import { createBasicHarborAPIConfig } from '../../../../domains/harbor';
import { writeNoneEvent } from './write-none';
import { writeBuiltEvent } from '../build';

export async function processCheckCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>;

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        await writeNoneEvent(message);

        return message;
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
        await writeBuiltEvent(message);

        return message;
    }

    await writeNoneEvent(message);

    return message;
}
