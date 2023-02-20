/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';
import type { RouterQueuePayload } from '../../../components';
import type { RegistryQueuePayload } from './type';
import type { RegistryQueueCommand } from './constants';

export function buildRegistryQueueMessage<T extends `${RegistryQueueCommand}`>(
    command: T,
    data: RegistryQueuePayload<T>,
    event?: string,
) : PublishOptionsExtended<RouterQueuePayload<RegistryQueuePayload<T>>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data,
            metadata: {
                component: ComponentName.REGISTRY,
                command,
                event,
            },
        },
    };
}
