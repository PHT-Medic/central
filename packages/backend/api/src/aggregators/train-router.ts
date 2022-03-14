/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainRunStatus } from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueRoutingKey } from '../config/mq';
import { TrainEntity } from '../domains/core/train/entity';
import { AggregatorTrainRouterEvent } from '../domains/special/aggregator';
import { useLogger } from '../config/log';

const EventStatusMap : Record<AggregatorTrainRouterEvent, TrainRunStatus> = {
    [AggregatorTrainRouterEvent.STOPPED]: TrainRunStatus.STOPPED,
    [AggregatorTrainRouterEvent.FAILED]: TrainRunStatus.FAILED,
};

async function updateTrain(id: Train['id'], event: AggregatorTrainRouterEvent) {
    useLogger()
        .info(`Received train-router ${event} event.`, { aggregator: 'train-router', payload: { id } });

    const repository = getRepository(TrainEntity);
    const entity = await repository.findOne(id);
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
                await updateTrain(message.data.id, AggregatorTrainRouterEvent.FAILED);
            },
            [AggregatorTrainRouterEvent.STOPPED]: async (message: Message) => {
                await updateTrain(message.data.id, AggregatorTrainRouterEvent.STOPPED);
            },
        });
    }

    return {
        start,
    };
}
