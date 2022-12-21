/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consumeQueue } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../config';
import { createSecretStorageComponentHandlers } from '../secret-storage';
import { createRegistryComponentHandlers } from '../registry';
import { createStationRegistryQueueComponentHandlers } from '../station-registry';
import { createTrainComponentHandlers } from '../train';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.COMMAND }, {
            ...createSecretStorageComponentHandlers(),
            ...createRegistryComponentHandlers(),
            ...createStationRegistryQueueComponentHandlers(),
            ...createTrainComponentHandlers(),
        });
    }

    return {
        start,
    };
}
