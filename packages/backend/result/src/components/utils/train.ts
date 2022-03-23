/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HTTPClient, TrainManagerBaseQueuePayload } from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { Message } from 'amqp-extension';
import { BaseError } from '../error';

export async function resolveTrain(message: Message) {
    const data = message.data as TrainManagerBaseQueuePayload;

    // -----------------------------------------------------------------------------------

    const client = useClient<HTTPClient>();

    try {
        data.entity = await client.train.getOne(data.id);
    } catch (e) {
        throw BaseError.notFound();
    }

    return {
        ...message,
        data,
    };
}
