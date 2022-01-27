/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    STATION_SECRET_ENGINE_KEY,
    StationSecretStoragePayload,
    VaultAPI,
    buildStationFromSecretStoragePayload,
    buildStationSecretStoragePayload,
    mergeDeep,
} from '@personalhealthtrain/ui-common';
import { useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { ApiKey } from '../../../../config/api';
import {
    SecretStorageStationQueuePayload,
} from '../../../../domains/special/secret-storage/type';
import { StationEntity } from '../../../../domains/core/station/entity';

export async function saveStationToSecretStorage(payload: SecretStorageStationQueuePayload) {
    const repository = await getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.registry_project_id',
            'station.registry_project_account_id',
            'station.registry_project_account_name',
            'station.registry_project_account_token',
            'station.registry_project_webhook_exists',
            'station.public_key',
            'station.secure_id',
            'station.email',
        ])
        .where('station.id = :id', { id: payload.id });

    let entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const response = await useClient<VaultAPI>(ApiKey.VAULT)
        .keyValue
        .find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, `${entity.secure_id}`);

    const data : StationSecretStoragePayload = mergeDeep(
        buildStationSecretStoragePayload(entity),
        (response ? response.data : {}),
    );

    await useClient<VaultAPI>(ApiKey.VAULT).keyValue.save(
        STATION_SECRET_ENGINE_KEY,
        `${entity.secure_id}`,
        data,
    );

    entity = repository.merge(entity, buildStationFromSecretStoragePayload(data));

    await repository.save(entity);
}

export async function deleteStationFromSecretStorage(payload: SecretStorageStationQueuePayload) {
    const repository = await getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.secure_id',
        ])
        .where('station.id = :id', { id: payload.id });

    const entity = await query.getOne();

    try {
        await useClient<VaultAPI>(ApiKey.VAULT).keyValue.delete(STATION_SECRET_ENGINE_KEY, `${entity.secure_id}`);
    } catch (e) {
        // ...
    }
}
