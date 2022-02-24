/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';

import { REGISTRY_OUTGOING_PROJECT_NAME } from '@personalhealthtrain/central-common';
import {
    ResultServiceCommand,
    buildResultServiceQueueMessage,
} from '../../../domains/special/result-service';
import { useLogger } from '../../../config/log';
import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../../domains/special/registry';

export async function dispatchRegistryEventToResultService(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : RegistryEventQueuePayload = message.data as RegistryEventQueuePayload;

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;
    // only process terminated trains and the PUSH_ARTIFACT event
    if (!isOutgoingProject || type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        return message;
    }

    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.START, {
        train_id: data.repositoryName,
        latest: true,
    }));

    useLogger().debug('train event pushed to result service aggregator.', { service: 'api-harbor-hook' });

    return message;
}
