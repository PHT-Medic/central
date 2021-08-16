import {getRepository} from "typeorm";
import {
    buildStationHarborProjectName,
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME, isHarborStationProjectName
} from "../../../config/services/harbor";

import {MQ_EN_EVENT_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {DispatcherProposalEventData, DispatcherProposalEventType} from "../../../domains/pht/proposal/queue";
import {Station} from "../../../domains/pht/station";
import {DispatcherTrainEventData, DispatcherTrainEventType} from "../../../domains/pht/train/queue";
import {TrainStation} from "../../../domains/pht/train/station";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";

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
    const data : DispatcherHarborEventData = message.data as DispatcherHarborEventData;

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
        const repository = getRepository(TrainStation);
        const query = repository.createQueryBuilder('trainStation')
            .leftJoinAndSelect('trainStation.station', 'station')
            .where("trainStation.train_id = :trainId", {trainId: data.repositoryName});

        const entities = await query.getMany();

        if(entities.length > 0) {
            // todo: be aware of sorting
            if(data.namespace === buildStationHarborProjectName(entities[0].station.secure_id)) {
                await publishQueueMessage(
                    MQ_EN_EVENT_ROUTING_KEY,
                    createQueueMessageTemplate('trainStarted', {
                        id: data.repositoryName
                    })
                );
            }

            const matchingStations = entities
                .filter(entity => buildStationHarborProjectName(entity.station.secure_id) === data.namespace);

            const currentStation : Station | undefined = matchingStations.length === 1 ? matchingStations[0].station : undefined;
            if(currentStation) {
                await publishQueueMessage(
                    MQ_EN_EVENT_ROUTING_KEY,
                    createQueueMessageTemplate('trainReady', {
                        id: data.repositoryName,
                        stationId: currentStation.id
                    })
                );
            }
        }
    }

    return message;
}
