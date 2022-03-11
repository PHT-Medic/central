import { Message, buildMessage, publishMessage } from 'amqp-extension';
import fs from 'fs';
import { TrainExtractorQueueEvent, TrainExtractorQueuePayload } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath } from '../../config/paths';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { checkIfLocalRegistryImageExists } from '../../modules/docker';

export async function statusImage(message: Message) {
    const data : TrainExtractorQueuePayload = message.data as TrainExtractorQueuePayload;

    // 1. Check if result already exists.
    const trainResultPath : string = buildImageOutputFilePath(data.repositoryName);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);

        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
            },
            type: TrainExtractorQueueEvent.EXTRACTED,
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
            type: TrainExtractorQueueEvent.DOWNLOADED,
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
        type: TrainExtractorQueueEvent.UNKNOWN,
        data: message.data,
        metadata: message.metadata,
    }));
}
