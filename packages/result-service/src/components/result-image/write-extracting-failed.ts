import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";

export async function writeExtractingFailedEvent(message: QueueMessage, error: Error) {
    await publishQueueMessage('ui.rs.event', createQueueMessageTemplate(
        'extractingFailed',
        {
            resultMessage: error.message,
            ...message.data
        },
        message.metadata
    ));

    return message;
}
