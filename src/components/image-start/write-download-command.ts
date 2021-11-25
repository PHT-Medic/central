import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../config/services/rabbitmq';
import { ResultServiceCommand } from '../../domains/service/result-service';

export async function writeDownloadCommand(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type: ResultServiceCommand.DOWNLOAD,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
