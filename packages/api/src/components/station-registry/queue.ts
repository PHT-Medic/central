/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName } from '../constants';
import type { RouterQueuePayload } from '../router';
import { ROUTER_QUEUE_ROUTING_KEY } from '../router';
import type { StationRegistryComponentCommand } from './consants';
import type { StationRegistryComponentPayload } from './type';

export function buildStationRegistryQueueMessage(
    command: StationRegistryComponentCommand,
    data: StationRegistryComponentPayload,
) : PublishOptionsExtended<RouterQueuePayload<StationRegistryComponentPayload>> {
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
