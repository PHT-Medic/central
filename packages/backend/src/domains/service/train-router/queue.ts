
import {MQ_TR_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {buildQueueMessage, QueueMessage} from "../../../modules/message-queue";

// -------------------------------------------

export enum TrainRouterHarborEvent {
    TRAIN_PUSHED = 'trainPushed'
}

export type TrainRouterHarborEventPayload = {
    repositoryFullName: string,
    operator: string
}

// -------------------------------------------

export enum TrainRouterCommand {
    START = 'startTrain',
    STOP = 'stopTrain'
}

export type TrainRouterCommandPayload = {
    trainId: string
};

// -------------------------------------------

export function buildTrainRouterQueueMessage<T extends TrainRouterCommand | TrainRouterHarborEvent>(
    type: T,
    data: T extends TrainRouterCommand ? TrainRouterCommandPayload : TrainRouterHarborEventPayload,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return buildQueueMessage({
        routingKey: MQ_TR_ROUTING_KEY,
        type,
        data,
        metadata: metaData
    });
}
