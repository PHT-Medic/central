import {
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME, isHarborStationProjectName
} from "../../../config/services/harbor";

import {MQ_EN_EVENT_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {DispatcherProposalEventData, DispatcherProposalEventType} from "../../../domains/pht/proposal/queue";
import {DispatcherTrainEventData, DispatcherTrainEventType} from "../../../domains/pht/train/queue";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";
import {DispatcherHarborEventWithAdditionalData} from "../data/harbor";

export async function dispatchProposalEventToEmailNotifier(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherProposalEventData = message.data as DispatcherProposalEventData;

    const mapping : Record<DispatcherProposalEventType, string> = {
        assigned: 'proposalAssigned',
        approved: 'proposalApproved',
        rejected: 'proposalRejected'
    }

    if(mapping[data.event]) {
        await publishQueueMessage(
            MQ_EN_EVENT_ROUTING_KEY,
            createQueueMessageTemplate(mapping[data.event], {
                id: data.id,
                operatorStationId: data.operatorStationId,
                operatorRealmId: data.operatorRealmId
            })
        );
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
        await publishQueueMessage(
            MQ_EN_EVENT_ROUTING_KEY,
            createQueueMessageTemplate(mapping[data.event], {
                id: data.id,
                operatorStationId: data.operatorStationId,
                operatorRealmId: data.operatorRealmId
            })
        );
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
        await publishQueueMessage(
            MQ_EN_EVENT_ROUTING_KEY,
            createQueueMessageTemplate('trainBuilt', {
                id: data.repositoryName
            })
        );

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
    if(isOutgoingProject) {
        await publishQueueMessage(
            MQ_EN_EVENT_ROUTING_KEY,
            createQueueMessageTemplate('trainFinished', {
                id: data.repositoryName
            })
        );

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
            await publishQueueMessage(
                MQ_EN_EVENT_ROUTING_KEY,
                createQueueMessageTemplate('trainStarted', {
                    id: data.repositoryName,
                    stationId: data.station?.id
                })
            );
        }

        await publishQueueMessage(
            MQ_EN_EVENT_ROUTING_KEY,
            createQueueMessageTemplate('trainReady', {
                id: data.repositoryName,
                stationId: data.station?.id
            })
        );
    }

    return message;
}
