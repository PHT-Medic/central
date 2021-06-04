import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateDownloaded} from "../../domains/train/result/states";

export async function writeDownloadedEvent(message: QueueMessage) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(TrainResultStateDownloaded, message.data, message.metadata));

    return message;
}
