/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainRunStatus } from '@personalhealthtrain/ui-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueTrainRouterRoutingKey } from '../config/service/mq';

export enum TrainRouterEvent {
    STOPPED = 'trainStopped',
    FAILED = 'trainFailed',
}

const EventStatusMap : Record<TrainRouterEvent, TrainRunStatus> = {
    [TrainRouterEvent.STOPPED]: TrainRunStatus.STOPPED,
    [TrainRouterEvent.FAILED]: TrainRunStatus.FAILED,
};

async function updateTrain(trainId: string, event: TrainRouterEvent) {
    const repository = getRepository(Train);

    await repository.update({
        id: trainId,
    }, {
        run_status: EventStatusMap[event],
    });
}

export function buildTrainRouterAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueTrainRouterRoutingKey.EVENT_IN }, {
            [TrainRouterEvent.FAILED]: async (message: Message) => {
                await updateTrain(message.data.trainId, TrainRouterEvent.FAILED);
            },
            [TrainRouterEvent.STOPPED]: async (message: Message) => {
                await updateTrain(message.data.trainId, TrainRouterEvent.STOPPED);
            },
        });
    }

    return {
        start,
    };
}
