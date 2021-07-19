import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";
import {MQ_TR_ROUTING_KEY} from "../../../config/services/rabbitmq";

// -------------------------------------------

export type HarborTrainRouterEvent = 'trainPushed';
export type HarborTrainRouterEventPayload = {
    repositoryFullName: string,
    operator: string
}

export function createTrainRouterQueueMessageEvent(
    event: HarborTrainRouterEvent,
    data: HarborTrainRouterEventPayload,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return createQueueMessageTemplate(event, data, metaData);
}

// -------------------------------------------

export type HarborTrainRouterCommand = 'startTrain' | 'stopTrain';
export type HarborTrainRouterCommandPayload = {
    trainId: string
};

export function createTrainRouterQueueMessageCommand(
    command: HarborTrainRouterCommand,
    data: HarborTrainRouterCommandPayload,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return createQueueMessageTemplate(command, data, metaData);
}

// -------------------------------------------

export async function publishTrainRouterQueueMessage(queueMessage: QueueMessage) {
    await publishQueueMessage(MQ_TR_ROUTING_KEY, queueMessage);
}
