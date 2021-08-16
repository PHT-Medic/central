import {
    isHarborStationProjectName
} from "../../../config/services/harbor";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {
    createTrainRouterQueueMessageEvent,
    publishTrainRouterQueueMessage
} from "../../../domains/service/train-router/queue";
import {useLogger} from "../../../modules/log";
import {QueueMessage} from "../../../modules/message-queue";

export async function dispatchHarborEventToTrainRouter(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherHarborEventData = message.data as DispatcherHarborEventData;

    // station project
    const isStationProject : boolean = isHarborStationProjectName(data.namespace);

    // only process station trains and the PUSH_ARTIFACT event
    if(!isStationProject || data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    await publishTrainRouterQueueMessage(createTrainRouterQueueMessageEvent(
        'trainPushed',
        {
            repositoryFullName: data.repositoryFullName,
            operator: data.operator
        }
    ));

    useLogger().debug('train event pushed to train router aggregator.', {service: 'api-harbor-hook'})

    return message;
}

