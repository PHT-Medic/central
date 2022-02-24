/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, buildMessage } from 'amqp-extension';
import {
    MessageQueueRoutingKey,
} from '../../../config/mq';
import { RegistryQueuePayload } from './type';
import { RegistryQueueCommand, RegistryQueueEvent } from './constants';

export type DispatcherHarborEventType = 'PUSH_ARTIFACT';

export type DispatcherHarborEventData = {
    event: DispatcherHarborEventType,
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    artifactDigest?: string,
    [key: string]: string
};

export function buildRegistryEventQueueMessage(
    type: `${RegistryQueueEvent}`,
    data: DispatcherHarborEventData,
    metaData: Record<string, any> = {},
) {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.EVENT,
        },
        type,
        data,
        metadata: metaData,
    });
}

export function buildRegistryQueueMessage(
    type: `${RegistryQueueCommand}`,
    data?: RegistryQueuePayload,
    metaData: Record<string, any> = {},
) : Message {
    return buildMessage({
        options: {
            routingKey: MessageQueueRoutingKey.COMMAND,
        },
        type,
        data: data || {},
        metadata: metaData,
    });
}
