/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage, publishMessage } from 'amqp-extension';
import fs from 'fs';
import { TrainManagerExtractingQueueEvent, TrainManagerExtractingQueuePayload } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath } from '../../config/paths';
import { buildRemoteDockerImageURL } from '../../config/services/registry';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { checkIfLocalRegistryImageExists } from '../../modules/docker';

export async function processExtractStatusCommand(message: Message) {
    const data : TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;

    // 1. Check if result already exists.
    const trainResultPath : string = buildImageOutputFilePath(data.repositoryName);

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

    const repositoryTag = buildRemoteDockerImageURL(data.projectName, data.repositoryName);
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
