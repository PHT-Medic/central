import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../config/rabbitmq";

export async function publishResultServiceResultCommand(command: string, data: Record<string,any>) {
    let queueMessage = createQueueMessageTemplate();
    queueMessage.type = command;
    queueMessage.metadata = {
        token: undefined
    }

    queueMessage.data = data;

    await publishResultServiceQueueMessage(queueMessage);
}

export async function publishResultServiceQueueMessage(message: QueueMessage) {
    await publishQueueMessage(MQ_RS_COMMAND_ROUTING_KEY, message);
}
