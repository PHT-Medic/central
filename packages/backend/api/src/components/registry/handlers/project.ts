/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import {
    Ecosystem,
    HTTPClientKey,
    HarborAPI,
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
    RegistryProjectSecretStoragePayload,
    VaultAPI,
    buildConnectionStringFromRegistry,
    buildRegistryProjectFromSecretStoragePayload,
    buildRegistryProjectSecretStoragePayload, createBasicHarborAPIConfig, mergeDeep,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import {
    RegistryQueueCommand,
    RegistryQueuePayload,
} from '../../../domains/special/registry';
import { ensureRemoteRegistryProjectAccount } from '../../../domains/special/registry/helpers/remote-robot-account';
import { ensureRemoteRegistryProject } from '../../../domains/special/registry/helpers/remote';
import { ensureRemoteRegistryProjectWebhook } from '../../../domains/special/registry/helpers/remote-webhook';
import { ApiKey } from '../../../config/api';
import { RegistryEntity } from '../../../domains/core/registry/entity';

export async function setupRegistryProjectForRemote(payload: RegistryQueuePayload<RegistryQueueCommand.PROJECT_SETUP>) {
    const repository = getRepository(RegistryProjectEntity);

    let { entity } = payload;

    if (!entity) {
        entity = await repository.createQueryBuilder('registryProject')
            .addSelect([
                'registryProject.external_id',
                'registryProject.account_id',
                'registryProject.account_name',
                'registryProject.account_token',
                'registryProject.webhook_exists',
                'registryProject.alias',
            ])
            .leftJoinAndSelect('registryProject.registry', 'registry')
            .where('registryProject.id = :id', { id: payload.entityId })
            .getOne();
    }

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const registryRepository = getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.address',
            'registry.account_name',
            'registry.account_token',
        ])
        .where('registryProject.id = :id', { id: entity.registry_id })
        .getOne();

    const connectionString = buildConnectionStringFromRegistry(registryEntity);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    switch (entity.ecosystem) {
        case Ecosystem.DEFAULT: {
            await ensureRemoteRegistryProject(httpClient, {
                remoteId: entity.external_id,
                remoteName: entity.external_name,
            });

            await ensureRemoteRegistryProjectAccount(httpClient, {
                name: entity.external_name,
                account: {
                    id: entity.account_id,
                    name: entity.account_name,
                    secret: entity.account_secret,
                },
            });

            await ensureRemoteRegistryProjectWebhook(httpClient, {
                idOrName: entity.external_name,
                isName: true,
            });

            // -------------------------------------------------------------------------

            const response = await useClient<VaultAPI>(HTTPClientKey.VAULT)
                .keyValue
                .find<RegistryProjectSecretStoragePayload>(REGISTRY_PROJECT_SECRET_ENGINE_KEY, `${entity.external_name}`);

            const data : RegistryProjectSecretStoragePayload = mergeDeep(
                (response ? response.data : {}),
                buildRegistryProjectSecretStoragePayload(entity),
            );

            await useClient<VaultAPI>(ApiKey.VAULT).keyValue.save(
                REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                `${entity.external_name}`,
                data,
            );

            entity = repository.merge(entity, buildRegistryProjectFromSecretStoragePayload(data));

            await repository.save(entity);
            break;
        }
        default:
            //
            break;
    }
}

export async function deleteRegistryProjectFromRemote(payload: RegistryQueuePayload<RegistryQueueCommand.PROJECT_DELETE>) {
    // todo : separate query for registry to get "hidden" files ;)

    const connectionString = buildConnectionStringFromRegistry(payload.entity.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    try {
        const isProjectName = !payload.entity.external_id;
        const id = isProjectName ?
            payload.entity.external_name :
            payload.entity.external_id;

        await httpClient.project
            .delete(id, isProjectName);
    } catch (e) {
        // ...
    }

    if (payload.entity.account_id) {
        try {
            await httpClient.robotAccount
                .delete(payload.entity.account_id);
        } catch (e) {
            // ...
        }

        const response = await useClient<VaultAPI>(ApiKey.VAULT)
            .keyValue.find<RegistryProjectSecretStoragePayload>(REGISTRY_PROJECT_SECRET_ENGINE_KEY, payload.entity.external_name);

        if (response) {
            response.data.account_id = null;
            response.data.account_name = null;
            response.data.account_secret = null;

            await useClient<VaultAPI>(ApiKey.VAULT)
                .keyValue.save(REGISTRY_PROJECT_SECRET_ENGINE_KEY, payload.entity.external_name, response.data);
        }
    }
}
