/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainResultStatus, hasOwnProperty } from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { ResultServiceDataPayload } from '../domains/special/result-service';
import { MessageQueueRoutingKey } from '../config/mq';
import { TrainEntity } from '../domains/core/train/entity';
import { TrainResultEntity } from '../domains/core/train-result/entity';
import { AggregatorTrainResultEvent } from '../domains/special/aggregator';

const EventStatusMap : Record<AggregatorTrainResultEvent, TrainResultStatus | null> = {
    [AggregatorTrainResultEvent.STARTING]: TrainResultStatus.STARTING,
    [AggregatorTrainResultEvent.STARTED]: TrainResultStatus.STARTED,
    [AggregatorTrainResultEvent.STOPPING]: TrainResultStatus.STOPPING,
    [AggregatorTrainResultEvent.STOPPED]: TrainResultStatus.STOPPED,
    [AggregatorTrainResultEvent.FAILED]: TrainResultStatus.FAILED,
    [AggregatorTrainResultEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [AggregatorTrainResultEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [AggregatorTrainResultEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [AggregatorTrainResultEvent.EXTRACTED]: TrainResultStatus.FINISHED,
    [AggregatorTrainResultEvent.UNKNOWN]: null,
};

async function handleTrainResult(data: ResultServiceDataPayload, event: AggregatorTrainResultEvent) {
    if (!(hasOwnProperty(EventStatusMap, event))) {
        return;
    }

    const status : TrainResultStatus | null = EventStatusMap[event];
    const latest = typeof data.latest === 'boolean' ? data.latest : true;

    const trainRepository = getRepository(TrainEntity);
    const train = await trainRepository.findOne(data.train_id);
    if (latest) {
        train.result_last_status = status;
        if (data.id) {
            train.result_last_id = data.id;
        }

        await trainRepository.save(train);
    }

    // If an id is available, then the progress succeeded :) ^^
    // This is nearly always the case, expect when no result id is generated.
    if (typeof data.id === 'undefined') {
        return;
    }

    const resultRepository = getRepository(TrainResultEntity);
    let result = await resultRepository.findOne(data.id);

    if (typeof result === 'undefined') {
        result = resultRepository.create({
            id: data.id,
            train_id: data.train_id,
            status,
            user_id: train.user_id,
            realm_id: train.realm_id,
        });
    } else {
        result = resultRepository.merge(result, {
            status,
        });
    }

    await resultRepository.save(result);
}

export function buildTrainResultAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_RESULT_SERVICE_EVENT }, {
            $any: async (message: Message) => {
                await handleTrainResult(
                    message.data as ResultServiceDataPayload,
                    message.type as AggregatorTrainResultEvent,
                );
            },
        });
    }

    return {
        start,
    };
}
