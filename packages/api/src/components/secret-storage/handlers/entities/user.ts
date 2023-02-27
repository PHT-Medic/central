/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    USER_SECRETS_SECRET_ENGINE_KEY,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import type { Client as VaultClient } from '@hapic/vault';
import { useDataSource } from 'typeorm-extension';
import { ApiKey } from '../../../../config';
import type {
    SecretStorageUserSecretsPayload,
} from '../../type';
import { UserSecretEntity } from '../../../../domains/user-secret/entity';

export async function deleteUserSecretsFromSecretStorage(payload: SecretStorageUserSecretsPayload) {
    try {
        await useClient<VaultClient>(ApiKey.VAULT).keyValue.delete(
            USER_SECRETS_SECRET_ENGINE_KEY,
            `${payload.id}`,
        );
    } catch (e) {
        // ...
    }
}

export async function saveUserSecretsToSecretStorage(payload: SecretStorageUserSecretsPayload) {
    const dataSource = await useDataSource();
    const repository = await dataSource.getRepository(UserSecretEntity);
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
