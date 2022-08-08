/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    TrainManagerBaseQueuePayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { Message } from 'amqp-extension';
import { BaseError } from '../error';

export async function extendQueuePayload(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBaseQueuePayload>;

    // -----------------------------------------------------------------------------------

    const client = useClient<HTTPClient>();

    try {
        data.entity = await client.train.getOne(data.id);
    } catch (e) {
        throw BaseError.notFound();
    }

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
