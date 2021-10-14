/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainResult,
    TrainResultStatus
} from "@personalhealthtrain/ui-common";
import {consumeQueue, Message} from "amqp-extension";
import {getRepository} from "typeorm";
import {ResultServiceDataPayload} from "../domains/service/result-service";
import {MessageQueueResultServiceRoutingKey} from "../config/service/mq";

export enum TrainResultEvent {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // rs trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // rs trigger

    DOWNLOADING = 'downloading', // rs trigger
    DOWNLOADED = 'downloaded', // rs trigger

    EXTRACTING = 'extracting', // rs trigger
    EXTRACTED = 'extracted', // rs trigger

    FAILED = 'failed' // rs trigger
}

const EventStatusMap : Record<TrainResultEvent, TrainResultStatus> = {
    [TrainResultEvent.STARTING]: TrainResultStatus.STARTING,
    [TrainResultEvent.STARTED]: TrainResultStatus.STARTED,
    [TrainResultEvent.STOPPING]: TrainResultStatus.STOPPING,
    [TrainResultEvent.STOPPED]: TrainResultStatus.STOPPED,
    [TrainResultEvent.FAILED]: TrainResultStatus.FAILED,
    [TrainResultEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [TrainResultEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [TrainResultEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [TrainResultEvent.EXTRACTED]: TrainResultStatus.FINISHED,
}

async function handleTrainResult(data: ResultServiceDataPayload, event: TrainResultEvent) {
    const status : TrainResultStatus = EventStatusMap[event];
    const latest = typeof data.latest === 'boolean' ? data.latest : true;

    if(latest) {
        const trainRepository = getRepository(Train);

        await trainRepository.update({
            id: data.trainId
        }, {
            result_last_status: status,
            ...(data.id ? {result_last_id: data.id} : {})
        });
    }

    // If an id is available, than the progress succeeded :) ^^
    // This is nearly always the case, expect when no result id is generated.
    if(typeof data.id === 'undefined') {
        return;
    }

    const resultRepository = getRepository(TrainResult);
    let result = await resultRepository.findOne({
        id: data.id,
        train_id: data.trainId
    });

    if (typeof result === 'undefined') {
        result = resultRepository.create({
            id: data.id,
            train_id: data.trainId,
            status
        });
    } else {
        result = resultRepository.merge(result, {
            status
        });
    }

    await resultRepository.save(result);
}

export function buildTrainResultAggregator() {
    function start() {
        return consumeQueue({routingKey: MessageQueueResultServiceRoutingKey.EVENT_IN}, {
            [TrainResultEvent.STARTED]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.STARTED);
            },
            [TrainResultEvent.STOPPED]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.STARTED);
            },
            [TrainResultEvent.DOWNLOADING]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.DOWNLOADING);
            },
            [TrainResultEvent.DOWNLOADED]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.DOWNLOADED);
            },
            [TrainResultEvent.EXTRACTING]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.EXTRACTING);
            },
            [TrainResultEvent.EXTRACTED]: async (message: Message) => {
                await handleTrainResult(message.data as ResultServiceDataPayload, TrainResultEvent.EXTRACTED);
            },
        });
    }

    return {
        start
    }
}
