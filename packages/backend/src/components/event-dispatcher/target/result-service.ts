import {buildMessage, Message, publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";

import {  HARBOR_OUTGOING_PROJECT_NAME,} from "../../../config/services/harbor";
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {TrainResult} from "../../../domains/pht/train-result";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {useLogger} from "../../../modules/log";

export async function dispatchHarborEventToResultService(
    message: Message
) : Promise<Message> {
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

    await publishMessage(buildMessage({
        options: {
            routingKey: MQ_RS_COMMAND_ROUTING_KEY
        },
        type: 'download',
        data: queueData
    }));

    useLogger().debug('train event pushed to result service aggregator.', {service: 'api-harbor-hook'})

    return message;
}

