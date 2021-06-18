import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {MQ_TR_ROUTING_KEY} from "../../config/rabbitmq";
import env from "../../env";
import {parseHarborConnectionString} from "../../modules/api/service/harbor";

const harborConfig = parseHarborConnectionString(env.harborConnectionString);

export const MQ_TR_EVENT_TRAIN_PUSHED = 'trainPushed';
export const MQ_TR_COMMAND_START_TRAIN = 'startTrain';
export const MQ_TR_COMMAND_STOP_TRAIN = 'stopTrain';

export function createTrainRouterQueueMessageEvent(repositoryFullName: string, type: string, hookOperator : string = harborConfig.user, metaData: Record<string, any> = {}) : QueueMessage {
    return createQueueMessageTemplate(type, {
        repositoryFullName: repositoryFullName,
        operator: hookOperator
    }, metaData);
}

export function createTrainRouterQueueMessageCommand(trainId: string, command: string, metaData: Record<string, any> = {}) : QueueMessage {
    return createQueueMessageTemplate(command, {
        trainId: trainId
    }, metaData);
}

export async function publishTrainRouterQueueMessage(queueMessage: QueueMessage) {
    await publishQueueMessage(MQ_TR_ROUTING_KEY, queueMessage);
}
