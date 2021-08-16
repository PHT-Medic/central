import {getRepository} from "typeorm";

import {  HARBOR_OUTGOING_PROJECT_NAME,} from "../../../config/services/harbor";
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {TrainResult} from "../../../domains/pht/train/result";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {useLogger} from "../../../modules/log";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";

export async function dispatchHarborEventToResultService(
    message: QueueMessage
) : Promise<QueueMessage> {
    const data : DispatcherHarborEventData = message.data as DispatcherHarborEventData;

    const isOutgoingProject : boolean = data.namespace === HARBOR_OUTGOING_PROJECT_NAME;
    // only process terminated trains and the PUSH_ARTIFACT event
    if(!isOutgoingProject || data.event !== 'PUSH_ARTIFACT') {
        return message;
    }

    const repository = getRepository(TrainResult);

    let entity = await repository.findOne({
        train_id: data.repositoryName
    });

    if(typeof entity === 'undefined') {
        const dbData = repository.create({
            train_id: data.repositoryName,
            image: data.repositoryFullName
        });

        await repository.save(dbData);

        entity = dbData;
    }

    const queueData : DispatcherHarborEventData = {
        ...data,

        // additional information
        trainId: data.repositoryName,
        resultId: entity.id
    }

    await publishQueueMessage(
        MQ_RS_COMMAND_ROUTING_KEY,
        createQueueMessageTemplate('download', queueData)
    );

    useLogger().debug('train event pushed to result service aggregator.', {service: 'api-harbor-hook'})

    return message;
}

