import {DispatcherTrainEvent} from "../../../../components/event-dispatcher";
import {MQ_DISPATCHER_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {createQueueMessageTemplate, publishQueueMessage} from "../../../../modules/message-queue";

export type DispatcherTrainEventType = 'approved' | 'assigned' | 'rejected';
export type DispatcherTrainEventData = {
    event: DispatcherTrainEventType,
    id: string | number,
    stationId: string | number,
    operatorRealmId: string | number
}

export async function emitDispatcherTrainEvent(
    data: DispatcherTrainEventData,
    metaData: Record<string, any> = {},
    options?: {
        templateOnly?: boolean
    }
) {
    options = options ?? {};

    const message = createQueueMessageTemplate(DispatcherTrainEvent, data, metaData);

    if(options.templateOnly) {
        return message;
    }

    await publishQueueMessage(MQ_DISPATCHER_ROUTING_KEY, message);

    return message;
}
