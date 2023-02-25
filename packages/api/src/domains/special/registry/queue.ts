/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';
import type { QueueRouterPayload } from '../../../components';
import type { RegistryQueuePayload } from './type';
import type { RegistryQueueCommand } from './constants';

type RegistryPayloadBuildContext<T extends `${RegistryQueueCommand}`> = {
    command: T,
    data: RegistryQueuePayload<T>,
    event?: string
};
export function buildRegistryPayload<T extends `${RegistryQueueCommand}`>(
    context: RegistryPayloadBuildContext<T>,
) : PublishOptionsExtended<QueueRouterPayload<RegistryQueuePayload<T>>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                component: ComponentName.REGISTRY,
                command: context.command,
                ...(context.event ? { event: context.event } : {}),
            },
        },
    };
}
