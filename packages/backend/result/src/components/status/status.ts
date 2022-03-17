import { Message, buildMessage, publishMessage } from 'amqp-extension';
import fs from 'fs';
import { TrainManagerExtractingQueueEvent, TrainManagerExtractingQueuePayload } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath } from '../../config/paths';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { checkIfLocalRegistryImageExists } from '../../modules/docker';

export async function statusImage(message: Message) {
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

    const repositoryTag = getHarborFQRepositoryPath(data.projectName, data.repositoryName);
    const exists : boolean = await checkIfLocalRegistryImageExists(repositoryTag);

    if (exists) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainManagerExtractingQueueEvent.DOWNLOADED,
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
