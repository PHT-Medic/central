/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import fs from 'fs';
import {
    HTTPClient, RegistryProjectType,
    TrainManagerExtractingQueueEvent,
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractingStep, TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { buildImageOutputFilePath } from '../../config/paths';
import { buildRemoteDockerImageURL } from '../../config/services/registry';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { checkIfLocalRegistryImageExists } from '../../modules/docker';
import { ExtractingError } from './error';

export async function processExtractStatusCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerExtractingQueuePayload>;

    if (!data.registry) {
        throw ExtractingError.registryNotFound({
            step: TrainManagerExtractingStep.STATUS,
        });
    }

    // 1. Check if result already exists.
    const trainResultPath : string = buildImageOutputFilePath(data.id);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);

        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainManagerExtractingQueueEvent.PROCESSED,
            data: message.data,
        }));

        return;
    } catch (e) {
        // do nothing :)
    }

    // 2. Check if image exists locally
    const client = useClient<HTTPClient>();

    const { data: incomingProjects } = await client.registryProject.getMany({
        filter: {
            registry_id: data.registry.id,
            type: RegistryProjectType.INCOMING,
        },
    });

    for (let i = 0; i < incomingProjects.length; i++) {
        const repositoryTag = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: incomingProjects[i].external_name,
            repositoryName: data.id,
        });

        const exists : boolean = await checkIfLocalRegistryImageExists(repositoryTag);

        if (exists) {
            await publishMessage(buildMessage({
                options: {
                    routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
                },
                type: TrainManagerExtractingQueueEvent.FINISHED,
                data: message.data,
                metadata: message.metadata,
            }));

            return;
        }
    }

    // 3. Is unknown

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerExtractingQueueEvent.UNKNOWN,
        data: message.data,
        metadata: message.metadata,
    }));
}
