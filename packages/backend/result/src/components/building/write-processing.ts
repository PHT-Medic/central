import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerBuildingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeProcessingEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerBuildingQueueEvent.STARTED,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
