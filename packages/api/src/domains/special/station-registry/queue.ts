/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type { RouterQueuePayload } from '../../../components';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';
import type { StationRegistryQueueCommand } from './consants';
import type { StationRegistryQueuePayload } from './type';

export function buildStationRegistryQueueMessage(
    command: StationRegistryQueueCommand,
    data: StationRegistryQueuePayload,
) : PublishOptionsExtended<RouterQueuePayload<StationRegistryQueuePayload>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data,
            metadata: {
                component: ComponentName.STATION_REGISTRY,
                command,
            },
        },
    };
}
