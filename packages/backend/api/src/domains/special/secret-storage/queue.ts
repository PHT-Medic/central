/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueSelfRoutingKey } from '../../../config/service/mq';
import { SecretStorageQueueCommand } from './constants';
import {
    SecretStorageQueuePayload,
} from './type';

export function buildSecretStorageQueueMessage(
    type: SecretStorageQueueCommand,
    context: SecretStorageQueuePayload,
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
