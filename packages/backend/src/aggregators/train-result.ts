
import {getRepository} from "typeorm";
import {TrainResult} from "../domains/pht/train-result";
import {
    TrainResultStatus
} from "../domains/pht/train-result/status";
import {MQ_UI_RS_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";
import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";

export enum TrainResultEvent {
    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
    DOWNLOADING_FAILED = 'downloadingFailed',
    EXTRACTING = 'extracting',
    EXTRACTED = 'extracted',
    EXTRACTING_FAILED = 'extractingFailed',
}

const EventStatusMap : Record<TrainResultEvent, TrainResultStatus> = {
    [TrainResultEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [TrainResultEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [TrainResultEvent.DOWNLOADING_FAILED]: TrainResultStatus.FAILED,
    [TrainResultEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [TrainResultEvent.EXTRACTED]: TrainResultStatus.FINISHED,
    [TrainResultEvent.EXTRACTING_FAILED]: TrainResultStatus.FAILED,
}

async function updateTrainResult(trainId: string, event: TrainResultEvent) {
    const repository = getRepository(TrainResult);

    await repository.update({
        train_id: trainId
    }, {
        status: EventStatusMap[event]
    });
}

function createTrainBuilderAggregatorHandlers() {
    return {
        [TrainResultEvent.DOWNLOADING]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.DOWNLOADING);
        },
        [TrainResultEvent.DOWNLOADED]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.DOWNLOADED);
        },
        [TrainResultEvent.DOWNLOADING_FAILED]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.DOWNLOADING_FAILED);
        },
        [TrainResultEvent.EXTRACTING]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.EXTRACTING);
        },
        [TrainResultEvent.EXTRACTED]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.EXTRACTED);
        },
        [TrainResultEvent.EXTRACTING_FAILED]: async (message: QueueMessage) => {
            await updateTrainResult(message.data.trainId, TrainResultEvent.EXTRACTING_FAILED);
        }
    }
}

export function buildTrainResultAggregator() {
    const handlers = createTrainBuilderAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_RS_EVENT_ROUTING_KEY, ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                console.log(e);
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
