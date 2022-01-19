/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    STATION_SECRET_ENGINE_KEY, USER_SECRETS_SECRET_ENGINE_KEY,
    VaultAPI,
} from '@personalhealthtrain/ui-common';
import { useTrapiClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { ApiKey } from '../../../../config/api';
import {
    SecretStorageDeleteUserSecretsQueuePayload,
    SecretStorageSaveUserSecretsQueuePayload,
} from '../../../../domains/extra/secret-storage/type';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';

export async function saveUserSecretsToSecretStorage(payload: SecretStorageSaveUserSecretsQueuePayload) {
    const repository = await getRepository(UserSecretEntity);
    const query = repository.createQueryBuilder('secret')
        .where('secret.user_id = :id', { id: payload.id })
        .orderBy('secret.created_at', 'DESC');

    const entities = await query.getMany();

    const secrets : Record<string, string> = {};

    for (let i = 0; i < entities.length; i++) {
        secrets[entities[i].id] = entities[i].content;
    }

    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(
        USER_SECRETS_SECRET_ENGINE_KEY,
        `${payload.id}`,
        secrets,
    );
}
export async function deleteUserSecretsFromSecretStorage(payload: SecretStorageDeleteUserSecretsQueuePayload) {
    try {
        await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.delete(
            USER_SECRETS_SECRET_ENGINE_KEY,
            `${payload.id}`,
        );
    } catch (e) {
        // ...
    }
}
