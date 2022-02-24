/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../../config/mq';
import { AggregatorTrainEventPayload } from './type';
import { AggregatorRegistryEvent } from './constants';

// -------------------------------------------

export function buildAggregatorRegistryQueueMessage(
    type: `${AggregatorRegistryEvent}`,
    data: AggregatorTrainEventPayload,
    metaData: Record<string, any> = {},
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.AGGREGATOR_REGISTRY_EVENT,
        },
        type,
        data,
        metadata: metaData,
    });
}
