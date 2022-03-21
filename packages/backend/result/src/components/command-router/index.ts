/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consumeQueue } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../config/services/rabbitmq';
import { createExtractingComponentHandlers } from '../extracting';
import { createBuildingComponentHandlers } from '../building';
import { createRoutingComponentHandlers } from '../routing';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueSelfRoutingKey.COMMAND }, {
            ...createBuildingComponentHandlers(),
            ...createExtractingComponentHandlers(),
            ...createRoutingComponentHandlers(),
        });
    }

    return {
        start,
    };
}
