/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainBuildStatus } from '@personalhealthtrain/ui-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueTrainBuilderRoutingKey } from '../config/service/mq';
import { TrainEntity } from '../domains/core/train/entity';

export enum TrainBuilderEvent {
    STARTED = 'trainBuildStarted',
    STOPPED = 'trainBuildStopped',
    FAILED = 'trainBuildFailed',
    FINISHED = 'trainBuildFinished',
}

const EventStatusMap : Record<TrainBuilderEvent, TrainBuildStatus> = {
    [TrainBuilderEvent.STARTED]: TrainBuildStatus.STARTED,
    [TrainBuilderEvent.STOPPED]: TrainBuildStatus.STOPPED,
    [TrainBuilderEvent.FAILED]: TrainBuildStatus.FAILED,
    [TrainBuilderEvent.FINISHED]: TrainBuildStatus.FINISHED,
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
        return consumeQueue({ routingKey: MessageQueueTrainBuilderRoutingKey.EVENT_IN }, {
            $any: async (message: Message) => {
                await updateTrain(message.data.trainId, message.type);
            },
        });
    }

    return {
        start,
    };
}
