/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    USER_SECRETS_SECRET_ENGINE_KEY,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { VaultClient } from '@trapi/vault-client';
import { ApiKey } from '../../../../config/api';
import {
    SecretStorageUserSecretsQueuePayload,
} from '../../../../domains/special/secret-storage/type';
import { UserSecretEntity } from '../../../../domains/core/user-secret/entity';

export async function deleteUserSecretsFromSecretStorage(payload: SecretStorageUserSecretsQueuePayload) {
    try {
        await useClient<VaultClient>(ApiKey.VAULT).keyValue.delete(
            USER_SECRETS_SECRET_ENGINE_KEY,
            `${payload.id}`,
        );
    } catch (e) {
        // ...
    }
}

export async function saveUserSecretsToSecretStorage(payload: SecretStorageUserSecretsQueuePayload) {
    const repository = await getRepository(UserSecretEntity);
    const query = repository.createQueryBuilder('secret')
        .where('secret.user_id = :id', { id: payload.id })
        .orderBy('secret.created_at', 'DESC');

    const entities = await query.getMany();

    if (entities.length === 0) {
        await deleteUserSecretsFromSecretStorage(payload);
        return;
    }

    const secrets : Record<string, string> = {};

    for (let i = 0; i < entities.length; i++) {
        secrets[entities[i].id] = entities[i].content;
    }

    await useClient<VaultClient>(ApiKey.VAULT).keyValue.save(
        USER_SECRETS_SECRET_ENGINE_KEY,
        `${payload.id}`,
        secrets,
    );
}
