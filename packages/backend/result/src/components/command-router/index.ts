import { consumeQueue } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../config/services/rabbitmq';
import { createExtractingComponentHandlers } from '../extracting';
import { createStatusComponentHandlers } from '../status';
import { createBuildingComponentHandlers } from '../building';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueSelfRoutingKey.COMMAND }, {
            ...createBuildingComponentHandlers(),
            ...createExtractingComponentHandlers(),
            ...createStatusComponentHandlers(),
        });
    }

    return {
        start,
    };
}
