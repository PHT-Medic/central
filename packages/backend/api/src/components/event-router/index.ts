/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consumeQueue } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../config/mq';
import { createRegistryEventHandlers } from '../registry-event';

export function buildEventRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.EVENT }, {
            ...createRegistryEventHandlers(),
        });
    }

    return {
        start,
    };
}
