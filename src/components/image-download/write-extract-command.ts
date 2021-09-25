import {buildMessage, Message, publishMessage} from "amqp-extension";
import {MessageQueueSelfRoutingKey} from "../../config/services/rabbitmq";
import {ResultServiceCommand} from "../../domains/result-service";

export async function writeExtractCommand(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND
        },
        type: ResultServiceCommand.EXTRACT,
        data: message.data,
        metadata: message.metadata
    }));

    return message;
}
