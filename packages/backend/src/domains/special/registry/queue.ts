/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import { MessageQueueDispatcherRoutingKey, MessageQueueSelfRoutingKey } from '../../../config/service/mq';
import { DispatcherEvent } from '../../../components/event-dispatcher/constants';
import { SecretStorageQueueCommand } from '../secret-storage/constants';
import { SecretStorageQueuePayload } from '../secret-storage/type';
import { RegistryQueuePayload } from './type';
import { RegistryQueueCommand } from './constants';

export type DispatcherHarborEventType = 'PUSH_ARTIFACT';

export type DispatcherHarborEventData = {
    event: DispatcherHarborEventType,
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    [key: string]: string
};

export function buildDispatcherHarborEvent(
    data: DispatcherHarborEventData,
    metaData: Record<string, any> = {},
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueDispatcherRoutingKey.EVENT_OUT,
        },
        type: DispatcherEvent.HARBOR,
        data,
        metadata: metaData,
    });
}

export function buildRegistryQueueMessage(
    type: RegistryQueueCommand,
    context?: RegistryQueuePayload,
) : Message {
    const data = context || {};

    return buildMessage({
        options: {
            routingKey: MessageQueueSelfRoutingKey.COMMAND,
        },
        type,
        data,
        metadata: {},
    });
}
