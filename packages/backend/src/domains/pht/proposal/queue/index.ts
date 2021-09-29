/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {MQ_DISPATCHER_ROUTING_KEY} from "@personalhealthtrain/ui-common";
import {buildMessage, publishMessage} from "amqp-extension";
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

    const message = buildMessage({
        options: {
            routingKey: MQ_DISPATCHER_ROUTING_KEY
        },
        type: DispatcherEvent.PROPOSAL,
        data,
        metadata: metaData
    })

    if(options.templateOnly) {
        return message;
    }

    await publishMessage(message);

    return message;
}
