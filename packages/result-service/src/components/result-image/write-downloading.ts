import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateDownloading} from "../../domains/train/result/states";

export async function writeDownloadingEvent(message: QueueMessage) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(TrainResultStateDownloading, message.data, message.metadata));

    return message;
}
