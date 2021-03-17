import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";

export async function writeDownloadingFailedEvent(message: QueueMessage, error: Error) {
    const queueMessage : QueueMessage = createQueueMessageTemplate();

    queueMessage.type = 'downloadingFailed';
    queueMessage.data = {
        resultMessage: error.message,
        ...message.data
    }

    await publishQueueMessage('ui.rs.event', queueMessage);

    return message;
}
