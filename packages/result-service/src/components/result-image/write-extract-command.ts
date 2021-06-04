import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";

export async function writeExtractCommand(message: QueueMessage) {
    await publishQueueMessage('rs.command', createQueueMessageTemplate('extract', message.data, message.metadata));

    return message;
}
