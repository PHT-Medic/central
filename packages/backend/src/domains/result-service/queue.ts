import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../config/services/rabbitmq";

export async function createResultServiceResultCommand(command: string, data: Record<string,any>) {
    let queueMessage = createQueueMessageTemplate();
    queueMessage.type = command;
    queueMessage.metadata = {
        token: undefined
    }

    queueMessage.data = data;

    await publishResultServiceQueueMessageCommand(queueMessage);
}

export async function publishResultServiceQueueMessageCommand(message: QueueMessage) {
    await publishQueueMessage(MQ_RS_COMMAND_ROUTING_KEY, message);
}
