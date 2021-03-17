import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateExtracted, TrainResultStateExtracting} from "../../domains/train/result/states";

export async function writeExtractedEvent(message: QueueMessage) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = TrainResultStateExtracted;

    await publishQueueMessage('ui.rs.event', queueMessage);

    return message;
}
