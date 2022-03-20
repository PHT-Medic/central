import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerRoutingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { RoutingError } from './error';

export async function writeFailedEvent(message: Message, error: RoutingError) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerRoutingQueueEvent.FAILED,
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
