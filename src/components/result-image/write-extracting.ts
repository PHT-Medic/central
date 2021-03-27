import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {TrainResultStateExtracting} from "../../domains/train/result/states";

export async function writeExtractingEvent(message: QueueMessage) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(TrainResultStateExtracting, message.data, message.metadata));

    return message;
}
