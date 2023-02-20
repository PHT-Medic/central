/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient, Registry, Train,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { BaseError } from '../error';

export async function extendPayload<T extends { id: Train['id'] }>(
    data: T,
) : Promise<TrainManagerQueuePayloadExtended<T>> {
    let train : Train;
    let registry: Registry;
    let registryId: Registry['id'];

    // -----------------------------------------------------------------------------------

    const client = useClient<HTTPClient>();

    try {
        train = await client.train.getOne(data.id);
    } catch (e) {
        throw BaseError.notFound({
            previous: e,
        });
    }

    try {
        registry = await client.registry.getOne(train.registry_id, {
            fields: ['+account_secret'],
        });
        registryId = registry.id;
    } catch (e) {
        throw BaseError.registryNotFound({
            previous: e,
        });
    }

    return {
        ...data,
        entity: train,
        registry,
        registryId,
    };
}
