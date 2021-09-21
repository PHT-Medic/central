import {
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME, isHarborStationProjectName
} from "../../../config/services/harbor";

import {MQ_EN_EVENT_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {
    DispatcherProposalEvent,
    DispatcherProposalEventData
} from "../../../domains/pht/proposal/queue";
import {DispatcherTrainEventData, DispatcherTrainEventType} from "../../../domains/pht/train/queue";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {DispatcherHarborEventWithAdditionalData} from "../data/harbor";
import {buildQueueMessage, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";

export async function dispatchProposalEventToEmailNotifier(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherProposalEventData = message.data as DispatcherProposalEventData;

    const mapping : Record<DispatcherProposalEvent, string> = {
        assigned: 'proposalAssigned',
        approved: 'proposalApproved',
        rejected: 'proposalRejected'
    }

    if(mapping[data.event]) {
        await publishQueueMessage(buildQueueMessage({
            routingKey: MQ_EN_EVENT_ROUTING_KEY,
            type: mapping[data.event],
            data: {
                id: data.id,
                stationId: data.stationId,
                operatorRealmId: data.operatorRealmId,
                // operatorId: '',
                // operatorType: 'user' | 'service'
            }
        }));
    }

    return message;
}

export async function dispatchTrainEventToEmailNotifier(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherTrainEventData = message.data as DispatcherTrainEventData;

    const mapping : Record<DispatcherTrainEventType, string> = {
        assigned: 'trainAssigned',
        approved: 'trainApproved',
        rejected: 'trainRejected'
    }

    if(mapping[data.event]) {
        await publishQueueMessage(buildQueueMessage({
            routingKey: MQ_EN_EVENT_ROUTING_KEY,
            type: mapping[data.event],
            data: {
                id: data.id,
                stationId: data.stationId,
                operatorRealmId: data.operatorRealmId
            }
        }));
    }

    return message;
}

export async function dispatchHarborEventToEmailNotifier(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if(data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    const isIncomingProject : boolean = data.namespace === HARBOR_INCOMING_PROJECT_NAME;
    if(isIncomingProject) {
        await publishQueueMessage(buildQueueMessage({
            routingKey: MQ_EN_EVENT_ROUTING_KEY,
            type: 'trainBuilt',
            data: {
                id: data.repositoryName
            }
        }));

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
    if(isOutgoingProject) {

        await publishQueueMessage(buildQueueMessage({
            routingKey: MQ_EN_EVENT_ROUTING_KEY,
            type: 'trainFinished',
            data: {
                id: data.repositoryName
            }
        }));

        return message;
    }

    // station project
    const isStationProject : boolean = isHarborStationProjectName(data.namespace);
    if(isStationProject) {
        if(
            typeof data.station === 'undefined' ||
            typeof data.stationIndex === 'undefined'
        ) {
            return message;
        }

        // If stationIndex is 0, than the target is the first station of the route.
        if(data.stationIndex === 0) {
            await publishQueueMessage(buildQueueMessage({
                routingKey: MQ_EN_EVENT_ROUTING_KEY,
                type: 'trainStarted',
                data: {
                    id: data.repositoryName,
                    stationId: data.station?.id
                }
            }));
        }

        await publishQueueMessage(buildQueueMessage({
            routingKey: MQ_EN_EVENT_ROUTING_KEY,
            type: 'trainReady',
            data: {
                id: data.repositoryName,
                stationId: data.station?.id
            }
        }));
    }

    return message;
}
