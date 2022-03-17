import { consumeQueue } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../config/services/rabbitmq';
import { createImageProcessComponentHandlers } from '../image-process';
import { createImageStatusComponentHandlers } from '../image-status';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueSelfRoutingKey.COMMAND }, {
            ...createImageProcessComponentHandlers(),
            ...createImageStatusComponentHandlers(),
        });
    }

    return {
        start,
    };
}
