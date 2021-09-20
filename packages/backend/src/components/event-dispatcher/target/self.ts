import {AggregatorMasterImagePushedEvent} from "../../../aggregators/dispatcher/handlers/master-image";
import {AggregatorTrainEvent} from "../../../aggregators/dispatcher/handlers/train";
import {
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME,
    HARBOR_SYSTEM_USER_NAME,
    isHarborStationProjectName
} from "../../../config/services/harbor";
import {MQ_UI_D_EVENT_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";
import {DispatcherHarborEventWithAdditionalData} from "../data/harbor";
import {TrainStationRunStatus} from "../../../domains/pht/train-station/status";

export async function dispatchHarborEventToSelf(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherHarborEventWithAdditionalData = message.data as DispatcherHarborEventData;

    if(data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    // master Image project
    const isLibraryProject : boolean = data.namespace === HARBOR_MASTER_IMAGE_PROJECT_NAME;
    if(isLibraryProject) {
        await processMasterImage(data);
        return message;
    }

    const isIncomingProject : boolean = data.namespace === HARBOR_INCOMING_PROJECT_NAME;
    if(isIncomingProject) {
        await processIncomingTrain(data);

        return message;
    }

    const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
    if(isOutgoingProject) {
        await processOutgoingTrain(data);

        return message;
    }

    // station project
    const isStationProject : boolean = isHarborStationProjectName(data.namespace);
    if(isStationProject) {
        await processStationTrain(data);
    }

    return message;
}

async function processMasterImage(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorMasterImagePushedEvent, {
            path: data.repositoryFullName,
            name: data.repositoryName
        })
    );
}

async function processIncomingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorTrainEvent.BUILD_FINISHED, {
            id: data.repositoryName
        })
    );
}

async function processOutgoingTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorTrainEvent.FINISHED, {
            id: data.repositoryName
        })
    );
}

async function processStationTrain(data: DispatcherHarborEventWithAdditionalData) : Promise<void> {
    if(
        typeof data.station === 'undefined' ||
        typeof data.stationIndex === 'undefined'
    ) {
        return;
    }

    // If stationIndex is 0, than the target is the first station of the route.
    if(data.stationIndex === 0) {
        await publishQueueMessage(
            MQ_UI_D_EVENT_ROUTING_KEY,
            createQueueMessageTemplate(AggregatorTrainEvent.STARTED, {
                id: data.repositoryName,
                stationId: data.station.id
            })
        );
    }

    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorTrainEvent.MOVED, {
            id: data.repositoryName,
            stationId: data.station.id,
            status: data.operator === HARBOR_SYSTEM_USER_NAME ? TrainStationRunStatus.ARRIVED : TrainStationRunStatus.DEPARTED
        })
    );
}
