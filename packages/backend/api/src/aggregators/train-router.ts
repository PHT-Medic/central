/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainRunStatus } from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueRoutingKey } from '../config/mq';
import { TrainEntity } from '../domains/core/train/entity';
import { AggregatorTrainRouterEvent } from '../domains/special/aggregator';

const EventStatusMap : Record<AggregatorTrainRouterEvent, TrainRunStatus> = {
    [AggregatorTrainRouterEvent.STOPPED]: TrainRunStatus.STOPPED,
    [AggregatorTrainRouterEvent.FAILED]: TrainRunStatus.FAILED,
};

async function updateTrain(trainId: string, event: AggregatorTrainRouterEvent) {
    const repository = getRepository(TrainEntity);
    const entity = await repository.findOne(trainId);
    if (typeof entity === 'undefined') {
        return;
    }

    entity.run_status = EventStatusMap[event];

    await repository.save(entity);
}

export function buildTrainRouterAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_TRAIN_ROUTER_EVENT }, {
            [AggregatorTrainRouterEvent.FAILED]: async (message: Message) => {
                await updateTrain(message.data.trainId, AggregatorTrainRouterEvent.FAILED);
            },
            [AggregatorTrainRouterEvent.STOPPED]: async (message: Message) => {
                await updateTrain(message.data.trainId, AggregatorTrainRouterEvent.STOPPED);
            },
        });
    }

    return {
        start,
    };
}
