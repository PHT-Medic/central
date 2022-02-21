/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consumeQueue } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../config/service/mq';
import { createSecretStorageComponentHandlers } from '../secret-storage';
import { createRegistryComponentHandlers } from '../registry';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueSelfRoutingKey.COMMAND }, {
            ...createSecretStorageComponentHandlers(),
            ...createRegistryComponentHandlers(),
        });
    }

    return {
        start,
    };
}
