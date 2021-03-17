import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateExtracting} from "../../domains/train/result/states";

export async function writeExtractingEvent(message: QueueMessage) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = TrainResultStateExtracting;

    await publishQueueMessage('ui.rs.event', queueMessage);

    return message;
}
