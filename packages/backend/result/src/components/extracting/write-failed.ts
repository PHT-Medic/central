import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerExtractingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { ExtractingError } from './error';

export async function writeFailedEvent(message: Message, error: ExtractingError) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerExtractingQueueEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: error.message,
                step: error.getOption('step'),
            },
        },
        metadata: message.metadata,
    }));

    return message;
}
