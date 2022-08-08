/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import {
    HTTPClient,
    TrainManagerBuildPayload,
    TrainManagerBuildingQueueEvent,
    TrainManagerQueuePayloadExtended,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from 'hapic';
import { Client as HarborClient } from '@hapic/harbor';
import { MessageQueueSelfToUIRoutingKey } from '../../config';
import { BuildingError } from './error';
import { createBasicHarborAPIConfig } from '../../domains/harbor';

export async function processBuildStatusEvent(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBuildPayload>;

    if (!data.entity) {
        throw BuildingError.notFound();
    }

    if (!data.registry) {
        throw BuildingError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainManagerBuildingQueueEvent.NONE,
            data: message.data,
            metadata: message.metadata,
        }));

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
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainManagerBuildingQueueEvent.FINISHED,
            data: message.data,
            metadata: message.metadata,
        }));

        return message;
    }

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerBuildingQueueEvent.NONE,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
