import {DispatcherHarborEvent} from "../../../../components/event-dispatcher";
import {MQ_DISPATCHER_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {createQueueMessageTemplate, publishQueueMessage} from "../../../../modules/message-queue";

export type DispatcherHarborEventType = 'PUSH_ARTIFACT';

export type DispatcherHarborEventData = {
    event: DispatcherHarborEventType,
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    [key: string]: string
}

export async function emitDispatcherHarborEvent(
    data: DispatcherHarborEventData,
    metaData: Record<string, any> = {},
    options?: {
        templateOnly?: boolean
    }
) {
    options = options ?? {};

    const message = createQueueMessageTemplate(DispatcherHarborEvent, data, metaData);

    if(!options.templateOnly) {
        await publishQueueMessage(MQ_DISPATCHER_ROUTING_KEY, message);
    }

    return message;
}
