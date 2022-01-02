/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainResult,
    TrainResultStatus,
    hasOwnProperty,
} from '@personalhealthtrain/ui-common';
import { Message, consumeQueue } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { ResultServiceDataPayload } from '../domains/extra/result-service';
import { MessageQueueResultServiceRoutingKey } from '../config/service/mq';

export enum TrainResultEvent {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // rs trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // rs trigger

    DOWNLOADING = 'downloading', // rs trigger
    DOWNLOADED = 'downloaded', // rs trigger

    EXTRACTING = 'extracting', // rs trigger
    EXTRACTED = 'extracted', // rs trigger

    FAILED = 'failed', // rs trigger

    UNKNOWN = 'unknown', // rs trigger
}

const EventStatusMap : Record<TrainResultEvent, TrainResultStatus | null> = {
    [TrainResultEvent.STARTING]: TrainResultStatus.STARTING,
    [TrainResultEvent.STARTED]: TrainResultStatus.STARTED,
    [TrainResultEvent.STOPPING]: TrainResultStatus.STOPPING,
    [TrainResultEvent.STOPPED]: TrainResultStatus.STOPPED,
    [TrainResultEvent.FAILED]: TrainResultStatus.FAILED,
    [TrainResultEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [TrainResultEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [TrainResultEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [TrainResultEvent.EXTRACTED]: TrainResultStatus.FINISHED,
    [TrainResultEvent.UNKNOWN]: null,
};

async function handleTrainResult(data: ResultServiceDataPayload, event: TrainResultEvent) {
    if (!(hasOwnProperty(EventStatusMap, event))) {
        return;
    }

    const status : TrainResultStatus | null = EventStatusMap[event];
    const latest = typeof data.latest === 'boolean' ? data.latest : true;

    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(data.trainId);
    if (latest) {
        train.result_last_status = status;
        if (data.id) {
            train.result_last_id = data.id;
        }

        await trainRepository.save(train);
    }

    // If an id is available, than the progress succeeded :) ^^
    // This is nearly always the case, expect when no result id is generated.
    if (typeof data.id === 'undefined') {
        return;
    }

    const resultRepository = getRepository(TrainResult);
    let result = await resultRepository.findOne(data.id);

    if (typeof result === 'undefined') {
        result = resultRepository.create({
            id: data.id,
            train_id: data.trainId,
            status,
            user_id: train.user_id,
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
        return consumeQueue({ routingKey: MessageQueueResultServiceRoutingKey.EVENT_IN }, {
            $any: async (message: Message) => {
                await handleTrainResult(
                    message.data as ResultServiceDataPayload,
                    message.type as TrainResultEvent,
                );
            },
        });
    }

    return {
        start,
    };
}
