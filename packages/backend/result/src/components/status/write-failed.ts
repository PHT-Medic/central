import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerExtractingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeFailedEvent(message: Message, error: Error) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerExtractingQueueEvent.FAILED,
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
