import { Message, buildMessage, publishMessage } from 'amqp-extension';
import { TrainManagerBuildingQueueEvent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfToUIRoutingKey } from '../../config/services/rabbitmq';
import { BuildingError } from './error';

export async function writeFailedEvent(message: Message, error: BuildingError) {
    console.log(error);
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT,
        },
        type: TrainManagerBuildingQueueEvent.FAILED,
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
