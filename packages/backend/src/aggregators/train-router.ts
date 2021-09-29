import {MQ_UI_TR_EVENT_ROUTING_KEY, Train, TrainRunStatus} from "@personalhealthtrain/ui-common";
import {consumeQueue, Message} from "amqp-extension";
import {getRepository} from "typeorm";

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

export function buildTrainRouterAggregator() {
    function start() {
        return consumeQueue({routingKey: MQ_UI_TR_EVENT_ROUTING_KEY}, {
            [TrainRouterEvent.FAILED]: async (message: Message) => {
                await updateTrain(message.data.trainId, TrainRouterEvent.FAILED);
            },
            [TrainRouterEvent.STOPPED]: async (message: Message) => {
                await updateTrain(message.data.trainId, TrainRouterEvent.STOPPED);
            }
        });
    }

    return {
        start
    }
}
