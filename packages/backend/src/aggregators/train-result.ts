import {consumeQueue, Message} from "amqp-extension";
import {getRepository} from "typeorm";
import {TrainResult} from "../domains/pht/train-result";
import {
    TrainResultStatus
} from "../domains/pht/train-result/status";
import {MQ_UI_RS_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";

export enum TrainResultEvent {
    FAILED = 'failed',

    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',

    EXTRACTING = 'extracting',
    EXTRACTED = 'extracted'
}

export enum TrainResultStep {
    DOWNLOAD = 'download',
    EXTRACT = 'extract'
}

const EventStatusMap : Record<TrainResultEvent, TrainResultStatus> = {
    [TrainResultEvent.FAILED]: TrainResultStatus.FAILED,
    [TrainResultEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [TrainResultEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [TrainResultEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [TrainResultEvent.EXTRACTED]: TrainResultStatus.FINISHED,
}

async function updateTrainResult(trainId: string, event: TrainResultEvent) {
    const repository = getRepository(TrainResult);

    await repository.update({
        train_id: trainId
    }, {
        status: EventStatusMap[event]
    });
}

export function buildTrainResultAggregator() {
    function start() {
        return consumeQueue({routingKey: MQ_UI_RS_EVENT_ROUTING_KEY}, {
            [TrainResultEvent.DOWNLOADING]: async (message: Message) => {
                await updateTrainResult(message.data.trainId, TrainResultEvent.DOWNLOADING);
            },
            [TrainResultEvent.DOWNLOADED]: async (message: Message) => {
                await updateTrainResult(message.data.trainId, TrainResultEvent.DOWNLOADED);
            },
            [TrainResultEvent.EXTRACTING]: async (message: Message) => {
                await updateTrainResult(message.data.trainId, TrainResultEvent.EXTRACTING);
            },
            [TrainResultEvent.EXTRACTED]: async (message: Message) => {
                await updateTrainResult(message.data.trainId, TrainResultEvent.EXTRACTED);
            },
        });
    }

    return {
        start
    }
}
