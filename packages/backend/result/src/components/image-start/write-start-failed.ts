import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainExtractorQueueEvent, TrainExtractorStep } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';

export async function writeStartFailedEvent(message: Message, error: Error) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainExtractorQueueEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: error.message,
                step: TrainExtractorStep.START,
            },
        },
        metadata: message.metadata,
    }));

    return message;
}
