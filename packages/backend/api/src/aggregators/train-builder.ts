/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainBuildStatus } from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueRoutingKey } from '../config/mq';
import { TrainEntity } from '../domains/core/train/entity';
import { AggregatorTrainBuilderEvent } from '../domains/special/aggregator';

const EventStatusMap : Record<AggregatorTrainBuilderEvent, TrainBuildStatus> = {
    [AggregatorTrainBuilderEvent.STARTED]: TrainBuildStatus.STARTED,
    [AggregatorTrainBuilderEvent.STOPPED]: TrainBuildStatus.STOPPED,
    [AggregatorTrainBuilderEvent.FAILED]: TrainBuildStatus.FAILED,
    [AggregatorTrainBuilderEvent.FINISHED]: TrainBuildStatus.FINISHED,
};

async function updateTrain(trainId: string, event: string) {
    if (!EventStatusMap[event]) {
        return;
    }

    const repository = getRepository(TrainEntity);
    const entity = await repository.findOne(trainId);
    if (typeof entity === 'undefined') {
        return;
    }

    entity.build_status = EventStatusMap[event];

    await repository.save(entity);
}

export function buildTrainBuilderAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_TRAIN_BUILDER_EVENT }, {
            $any: async (message: Message) => {
                await updateTrain(message.data.id, message.type);
            },
        });
    }

    return {
        start,
    };
}
