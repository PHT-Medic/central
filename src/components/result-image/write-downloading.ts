import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateDownloading} from "../../domains/train/result/states";

export async function writeDownloadingEvent(message: QueueMessage) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = TrainResultStateDownloading;

    await publishQueueMessage('ui.rs.event', queueMessage);

    return message;
}
