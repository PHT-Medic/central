import {DispatcherProposalEvent} from "../../../../components/event-dispatcher";
import {MQ_DISPATCHER_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {createQueueMessageTemplate, publishQueueMessage} from "../../../../modules/message-queue";

export type DispatcherProposalEventType = 'approved' | 'rejected' | 'assigned';
export type DispatcherProposalEventData = {
    event: DispatcherProposalEventType,
    id: string | number,
    operatorStationId: string | number,
    operatorRealmId: string
}

export async function emitDispatcherProposalEvent(
    data: DispatcherProposalEventData,
    metaData: Record<string, any> = {},
    options?: {
        templateOnly?: boolean
    }
) {
    options = options ?? {};

    const message = createQueueMessageTemplate(DispatcherProposalEvent, data, metaData);

    if(options.templateOnly) {
        await publishQueueMessage(MQ_DISPATCHER_ROUTING_KEY, message);
    }

    return message;
}
