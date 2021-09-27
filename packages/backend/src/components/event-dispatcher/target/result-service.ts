import {Message, publishMessage} from "amqp-extension";

import {HARBOR_OUTGOING_PROJECT_NAME,} from "../../../config/services/harbor";
import {DispatcherHarborEventData} from "../../../domains/service/harbor/queue";
import {
    buildResultServiceQueueMessage,
    ResultServiceCommand
} from "../../../domains/service/result-service/queue";
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

    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.START, {
        trainId: data.repositoryName
    }));

    useLogger().debug('train event pushed to result service aggregator.', {service: 'api-harbor-hook'})

    return message;
}

