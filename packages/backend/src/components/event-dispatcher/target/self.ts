import {getRepository} from "typeorm";
import {AggregatorMasterImagePushedEvent} from "../../../aggregators/dispatcher/handlers/masterImage";
import {AggregatorTrainBuiltEvent, AggregatorTrainFinishedEvent, AggregatorTrainStartedEvent} from "../../../aggregators/dispatcher/handlers/train";
import {
    buildStationHarborProjectName,
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME, HARBOR_OUTGOING_PROJECT_NAME,
    isHarborStationProjectName
} from "../../../config/services/harbor";
import {MQ_UI_D_EVENT_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {TrainStation} from "../../../domains/pht/train/station";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";

export async function dispatchHarborEventToSelf(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherHarborEventData = message.data as DispatcherHarborEventData;

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

async function processMasterImage(data: DispatcherHarborEventData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorMasterImagePushedEvent, {
            path: data.repositoryFullName,
            name: data.repositoryName
        })
    );
}

async function processIncomingTrain(data: DispatcherHarborEventData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorTrainBuiltEvent, {
            id: data.repositoryName
        })
    );
}

async function processOutgoingTrain(data: DispatcherHarborEventData) : Promise<void> {
    await publishQueueMessage(
        MQ_UI_D_EVENT_ROUTING_KEY,
        createQueueMessageTemplate(AggregatorTrainFinishedEvent, {
            id: data.repositoryName
        })
    );
}

async function processStationTrain(data: DispatcherHarborEventData) : Promise<void> {
    const repository = getRepository(TrainStation);
    const query = repository.createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .where("trainStation.train_id = :trainId", {trainId: data.repositoryName});

    const entities = await query.getMany();

    if(entities.length > 0) {
        // todo: be aware of sorting
        if(data.namespace === buildStationHarborProjectName(entities[0].station.secure_id)) {
            await publishQueueMessage(
                MQ_UI_D_EVENT_ROUTING_KEY,
                createQueueMessageTemplate(AggregatorTrainStartedEvent, {
                    id: data.repositoryName,
                    stationId: entities[0].station.id
                })
            );
        }
    }

    // todo: emit train status progress
}
