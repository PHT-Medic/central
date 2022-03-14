/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../../config/mq';
import { StationRegistryQueueCommand } from './consants';
import { StationRegistryQueuePayload } from './type';

export function buildStationRegistryQueueMessage(
    type: StationRegistryQueueCommand,
    context: StationRegistryQueuePayload,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.COMMAND,
        },
        type,
        data: context,
        metadata: {},
    });
}
