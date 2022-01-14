/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../../config/service/mq';
import { ServiceCommand } from './constants';
import { ServiceQueueMessagePayload } from './type';

export function buildServiceSecurityQueueMessage(
    type: ServiceCommand,
    context: ServiceQueueMessagePayload,
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type,
        data: context,
        metadata: {},
    });
}
