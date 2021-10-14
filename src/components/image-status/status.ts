import {buildMessage, Message, publishMessage} from "amqp-extension";
import fs from "fs";
import {getTrainResultFilePath} from "../../config/paths";
import {getHarborFQRepositoryPath} from "../../config/services/harbor";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {ResultServiceDataPayload} from "../../domains/service/result-service";
import {TrainResultEvent} from "../../domains/train-result/type";
import {checkIfLocalRegistryImageExists, useDocker} from "../../modules/docker";

export async function statusImage(message: Message) {
    const data : ResultServiceDataPayload = message.data as ResultServiceDataPayload;

    if(typeof data.id === 'undefined') {
        return;
    }

    // 1. Check if result already exists.
    const trainResultPath : string = getTrainResultFilePath(data.id);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);

        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT
            },
            type: TrainResultEvent.EXTRACTED,
            data: message.data,
        }));

        return;
    } catch (e) {
        // do nothing :)
    }

    // 2. Check if image exists locally

    const repositoryTag = getHarborFQRepositoryPath(data.id);
    const exists : boolean = await checkIfLocalRegistryImageExists(repositoryTag);

    if(exists) {
        await publishMessage(buildMessage({
            options: {
                routingKey: MessageQueueSelfToUIRoutingKey.EVENT
            },
            type: TrainResultEvent.DOWNLOADED,
            data: message.data,
            metadata: message.metadata
        }));

        return;
    }

    // 3. Is unknown

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT
        },
        type: TrainResultEvent.UNKNOWN,
        data: message.data,
        metadata: message.metadata
    }));
}
