/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    STATION_SECRET_ENGINE_KEY, VaultAPI, buildStationSecretStoragePayload,
} from '@personalhealthtrain/ui-common';
import { useTrapiClient } from '@trapi/client';
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
            'station.registry_project_account_name',
            'station.registry_project_account_token',
            'station.public_key',
            'station.secure_id',
        ])
        .where('station.id = :id', { id: payload.id });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const data = buildStationSecretStoragePayload(entity);
    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(
        STATION_SECRET_ENGINE_KEY,
        `${entity.secure_id}`,
        data,
    );
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
        await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.delete(STATION_SECRET_ENGINE_KEY, `${entity.secure_id}`);
    } catch (e) {
        // ...
    }
}
