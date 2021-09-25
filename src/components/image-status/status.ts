import {buildMessage, Message, publishMessage} from "amqp-extension";
import {ImageInfo} from "dockerode";
import fs from "fs";
import {getTrainResultFilePath} from "../../config/paths";
import {getFullHarborRepositoryNamePath} from "../../config/services/harbor";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {TrainResultEvent} from "../../domains/train-result/type";
import {checkIfLocalRegistryImageExists, useDocker} from "../../modules/docker";

export async function statusImage(message: Message) {
    // 1. Check if result already exists.
    const trainResultPath : string = getTrainResultFilePath(message.data.resultId);

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

    // 2. Check if image is downloaded

    const repositoryTag = getFullHarborRepositoryNamePath(message.data.repositoryFullName);
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
    }
}
