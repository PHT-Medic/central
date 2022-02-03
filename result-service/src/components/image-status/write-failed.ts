import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { TrainResultEvent } from '../../domains/train-result/type';

export async function writeFailedEvent(message: Message, error: Error) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainResultEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: error.message,
                step: null,
            },
        },
        metadata: message.metadata,
    }));

    return message;
}
