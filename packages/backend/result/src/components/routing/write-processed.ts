import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerRoutingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeProcessedEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerRoutingQueueEvent.MOVE_FINISHED,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
