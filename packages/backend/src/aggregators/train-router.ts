import {getRepository} from "typeorm";
import {Train} from "../domains/pht/train";
import {TrainRunStatus} from "../domains/pht/train/status";
import {MQ_UI_TB_EVENT_ROUTING_KEY} from "../config/services/rabbitmq";
import {consumeMessageQueue, handleMessageQueueChannel, QueueMessage} from "../modules/message-queue";

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
        id: trainId
    }, {
        run_status: EventStatusMap[event]
    });
}

function createTrainBuilderAggregatorHandlers() {
    return {
        [TrainRouterEvent.FAILED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainRouterEvent.FAILED);
        },
        [TrainRouterEvent.STOPPED]: async (message: QueueMessage) => {
            await updateTrain(message.data.trainId, TrainRouterEvent.STOPPED);
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
