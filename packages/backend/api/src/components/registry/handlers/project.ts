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
    HarborAPI,
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
    RegistryProjectSecretStoragePayload,
    VaultAPI,
    buildAPIConnectionStringFromRegistry,
    createBasicHarborAPIConfig,
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

export async function linkRegistryProject(
    payload: RegistryQueuePayload<RegistryQueueCommand.PROJECT_LINK>,
) {
    const repository = getRepository(RegistryProjectEntity);

    let { entity } = payload;

    if (!entity) {
        entity = await repository.createQueryBuilder('registryProject')
            .addSelect([
                'registryProject.account_secret',
            ])
            .where('registryProject.id = :id', { id: payload.id })
            .getOne();
    }

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (entity.ecosystem !== Ecosystem.DEFAULT) {
        return;
    }

    const registryRepository = getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: entity.registry_id })
        .getOne();

    const connectionString = buildAPIConnectionStringFromRegistry(registryEntity);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    await ensureRemoteRegistryProject(httpClient, {
        remoteId: entity.external_id,
        remoteName: entity.external_name,
        remoteOptions: {
            public: entity.public,
        },
    });

    const robotAccount = await ensureRemoteRegistryProjectAccount(httpClient, {
        name: entity.external_name,
        account: {
            id: entity.account_id,
            name: entity.account_name,
            secret: entity.account_secret,
        },
    });

    if (robotAccount) {
        entity.account_id = `${robotAccount.id}`;
        entity.account_name = robotAccount.name;
        entity.account_secret = robotAccount.secret;
    } else {
        entity.account_id = null;
        entity.account_name = null;
        entity.account_secret = null;
    }

    const webhook = await ensureRemoteRegistryProjectWebhook(httpClient, {
        idOrName: entity.external_name,
        isName: true,
    });

    if (webhook) {
        entity.webhook_name = webhook.name;
        entity.webhook_exists = true;
    }

    await repository.save(entity);
}

export async function unlinkRegistryProject(
    payload: RegistryQueuePayload<RegistryQueueCommand.PROJECT_UNLINK>,
) {
    const registryRepository = getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: payload.registryId })
        .getOne();

    const connectionString = buildAPIConnectionStringFromRegistry(registryEntity);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    try {
        await httpClient.project
            .delete(payload.externalName, true);
    } catch (e) {
        // ...
    }

    if (payload.accountId) {
        try {
            await httpClient.robotAccount
                .delete(payload.accountId);
        } catch (e) {
            // ...
        }

        const response = await useClient<VaultAPI>(ApiKey.VAULT)
            .keyValue.find<RegistryProjectSecretStoragePayload>(REGISTRY_PROJECT_SECRET_ENGINE_KEY, payload.externalName);

        if (response) {
            response.data.account_id = null;
            response.data.account_name = null;
            response.data.account_secret = null;

            await useClient<VaultAPI>(ApiKey.VAULT)
                .keyValue.save(REGISTRY_PROJECT_SECRET_ENGINE_KEY, payload.externalName, response.data);
        }
    }

    if (payload.updateDatabase) {
        const projectRepository = getRepository(RegistryProjectEntity);
        const project = await projectRepository.findOne(payload.id);

        if (project) {
            project.external_id = null;

            project.account_id = null;
            project.account_name = null;
            project.account_secret = null;

            project.webhook_exists = false;
            project.webhook_name = null;

            await projectRepository.save(project);
        }
    }
}

export async function relinkRegistryProject(
    payload: RegistryQueuePayload<RegistryQueueCommand.PROJECT_RELINK>,
) {
    await unlinkRegistryProject(payload);
    await linkRegistryProject(payload);
}
