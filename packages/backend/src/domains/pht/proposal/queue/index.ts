import {MQ_DISPATCHER_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {buildQueueMessage, publishQueueMessage} from "../../../../modules/message-queue";
import {DispatcherEvent} from "../../../../components/event-dispatcher";

export enum DispatcherProposalEvent {
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ASSIGNED = 'assigned'
}

export type DispatcherProposalEventData = {
    event: DispatcherProposalEvent,
    id: string | number,
    stationId?: string | number,
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

    const message = buildQueueMessage({
        routingKey: MQ_DISPATCHER_ROUTING_KEY,
        type: DispatcherEvent.PROPOSAL,
        data,
        metadata: metaData
    })

    if(options.templateOnly) {
        return message;
    }

    await publishQueueMessage(message);

    return message;
}
