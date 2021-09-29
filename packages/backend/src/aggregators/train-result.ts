/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MQ_UI_RS_EVENT_ROUTING_KEY,
    Train,
    TrainResult,
    TrainResultStatus
} from "@personalhealthtrain/ui-common";
import {consumeQueue, Message} from "amqp-extension";
import {getRepository} from "typeorm";
import {ResultServiceDataPayload} from "../domains/service/result-service";


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

export enum TrainResultStep {
    START = 'start',
    STOP = 'stop',
    DOWNLOAD = 'download',
    EXTRACT = 'extract'
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
    const trainRepository = getRepository(Train);

    await trainRepository.update({
        id: data.trainId
    }, {
        result_status: EventStatusMap[event]
    });

    const status : TrainResultStatus = EventStatusMap[event];

    console.log(data, event, status);

    // If an id is available, than the progress succeeded :) ^^
    if(
        [TrainResultStatus.EXTRACTED, TrainResultStatus.FINISHED].indexOf(status) !== -1 &&
        typeof data.id !== 'undefined'
    ) {
        const resultRepository = getRepository(TrainResult);
        const result = await resultRepository.findOne({train_id: data.trainId});

        if (typeof result === 'undefined') {
            const dbData = resultRepository.create({
                id: data.id,
                train_id: data.trainId
            });

            await resultRepository.save(dbData);
        }
    }
}

export function buildTrainResultAggregator() {
    function start() {
        return consumeQueue({routingKey: MQ_UI_RS_EVENT_ROUTING_KEY}, {
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
