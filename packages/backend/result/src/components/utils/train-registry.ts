/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    TrainManagerBaseQueuePayload,
} from '@personalhealthtrain/central-common';
import { Message } from 'amqp-extension';
import { useClient } from '@trapi/client';
import { BaseError } from '../error';

export async function resolveTrainRegistry(message: Message) : Promise<Message> {
    const data = message.data as TrainManagerBaseQueuePayload;

    if (!data.entity) {
        return message;
    }

    const client = useClient<HTTPClient>();

    // -----------------------------------------------------------------------------------

    try {
        data.registry = await client.registry.getOne(data.entity.registry_id, {
            fields: ['+account_secret'],
        });
        data.registryId = data.registry.id;
    } catch (e) {
        throw BaseError.registryNotFound();
    }

    return {
        ...message,
        data,
    };
}
