/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, consumeQueue } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../config/mq';
import { handleRegistryTrainEvent } from './train';
import { AggregatorRegistryEvent } from '../../domains/special/aggregator';

export function buildRegistryAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_REGISTRY_EVENT }, {
            [AggregatorRegistryEvent.TRAIN_INITIALIZED]: async (message: Message) => {
                await handleRegistryTrainEvent(message);
            },
            [AggregatorRegistryEvent.TRAIN_STARTED]: async (message: Message) => {
                await handleRegistryTrainEvent(message);
            },
            [AggregatorRegistryEvent.TRAIN_MOVED]: async (message: Message) => {
                await handleRegistryTrainEvent(message);
            },
            [AggregatorRegistryEvent.TRAIN_FINISHED]: async (message: Message) => {
                await handleRegistryTrainEvent(message);
            },
        });
    }

    return {
        start,
    };
}
