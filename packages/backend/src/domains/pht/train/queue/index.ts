/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildMessage, publishMessage } from 'amqp-extension';
import { DispatcherEvent } from '../../../../components/event-dispatcher';
import { MessageQueueDispatcherRoutingKey } from '../../../../config/service/mq';

export type DispatcherTrainEventType = 'approved' | 'assigned' | 'rejected';
export type DispatcherTrainEventData = {
    event: DispatcherTrainEventType,
    id: string | number,
    stationId: string | number,
    operatorRealmId: string | number
};

export async function emitDispatcherTrainEvent(
    data: DispatcherTrainEventData,
    metaData: Record<string, any> = {},
    options?: {
        templateOnly?: boolean
    },
) {
    options = options ?? {};

    const message = buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_OUT,
        },
        type: DispatcherEvent.TRAIN,
        data,
        metadata: metaData,
    });

    if (options.templateOnly) {
        return message;
    }

    await publishMessage(message);

    return message;
}
