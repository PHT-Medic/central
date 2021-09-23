import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {TrainBuildStatus} from "../domains/pht/train/status";
import {MQ_UI_TB_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";
import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";

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
    [TrainBuilderEvent.FINISHED]: TrainBuildStatus.FINISHED
};

async function updateTrain(trainId: string, event: TrainBuilderEvent) {
    const repository = getRepository(Train);

    await repository.update({
        id: trainId
    }, {
        build_status: EventStatusMap[event]
    });
}

function createTrainBuilderAggregatorHandlers() {
    return {
        [TrainBuilderEvent.FINISHED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainBuilderEvent.FINISHED);
        },
        [TrainBuilderEvent.FAILED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainBuilderEvent.FAILED);
        },
        [TrainBuilderEvent.STOPPED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainBuilderEvent.STOPPED);
        },
        [TrainBuilderEvent.STARTED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainBuilderEvent.STARTED);
        }
    }
}

export function buildTrainBuilderAggregator() {
    const handlers = createTrainBuilderAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_TB_EVENT_ROUTING_KEY, ((async (channel, msg) => {
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
