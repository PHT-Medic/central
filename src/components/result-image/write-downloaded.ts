import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateDownloaded} from "../../domains/train/result/states";

export async function writeDownloadedEvent(message: QueueMessage) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = TrainResultStateDownloaded;

    await publishQueueMessage('ui.rs.event', queueMessage);

    return message;
}
