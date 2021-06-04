import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateExtracted} from "../../domains/train/result/states";

export async function writeExtractedEvent(message: QueueMessage) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(TrainResultStateExtracted, message.data, message.metadata));

    return message;
}
