import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";

export async function writeDownloadingFailedEvent(message: QueueMessage, error: Error) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(
        'downloadingFailed',
        {
            resultMessage: error.message,
            ...message.data
        },
        message.metadata
    ));

    return message;
}
