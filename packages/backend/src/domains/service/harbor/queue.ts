/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildMessage} from "amqp-extension";
import {DispatcherEvent} from "../../../components/event-dispatcher";
import {MessageQueueDispatcherRoutingKey} from "../../../config/service/mq";

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

export function buildDispatcherHarborEvent(
    data: DispatcherHarborEventData,
    metaData: Record<string, any> = {}
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_OUT
        },
        type: DispatcherEvent.HARBOR,
        data,
        metadata: metaData
    });
}
