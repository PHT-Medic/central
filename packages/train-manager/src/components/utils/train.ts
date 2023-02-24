/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient, Registry, Train,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { BaseError } from '../error';
import type { ComponentPayloadExtended } from '../type';

export async function extendPayload<T extends Partial<ComponentPayloadExtended<{ id: Train['id'] }>>>(
    data: T,
) : Promise<ComponentPayloadExtended<T>> {
    let train : Train;
    let registry: Registry;

    // -----------------------------------------------------------------------------------

    const client = useClient<HTTPClient>();

    if (data.entity) {
        train = data.entity;
    } else {
        try {
            train = await client.train.getOne(data.id);
        } catch (e) {
            throw BaseError.notFound({
                previous: e,
            });
        }
    }

    if (data.registry) {
        registry = data.registry;
    } else {
        try {
            registry = await client.registry.getOne(train.registry_id, {
                fields: ['+account_secret'],
            });
        } catch (e) {
            throw BaseError.registryNotFound({
                previous: e,
            });
        }
    }

    return {
        ...data,
        entity: train,
        registry,
    };
}
