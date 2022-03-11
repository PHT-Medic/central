import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainExtractorQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeExtractedEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainExtractorQueueEvent.EXTRACTED,
        data: message.data,
        metadata: message.metadata,
    }));

    return message;
}
