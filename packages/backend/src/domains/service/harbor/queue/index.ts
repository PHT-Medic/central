import {DispatcherEvent} from "../../../../components/event-dispatcher";
import {MQ_DISPATCHER_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {buildQueueMessage, publishQueueMessage} from "../../../../modules/message-queue";

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

    const message = buildQueueMessage({
        routingKey: MQ_DISPATCHER_ROUTING_KEY,
        type: DispatcherEvent.HARBOR,
        data,
        metadata: metaData
    });

    if(!options.templateOnly) {
        await publishQueueMessage(message);
    }

    return message;
}
