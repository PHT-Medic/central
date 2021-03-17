import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";

export async function writeExtractCommand(message: QueueMessage) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = 'extract';

    await publishQueueMessage('rs.command', queueMessage);

    return message;
}
