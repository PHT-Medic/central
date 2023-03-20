/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import type { Client as VaultClient } from '@hapic/vault';
import { useDataSource } from 'typeorm-extension';
import { RegistryEntity, RegistryProjectEntity } from '../../../domains';
import { RegistryCommand } from '../constants';
import type { RegistryProjectLinkPayload, RegistryProjectUnlinkPayload } from '../type';
import { ensureRemoteRegistryProjectAccount } from './helpers/remote-robot-account';
import { ensureRemoteRegistryProject } from './helpers/remote';
import { saveRemoteRegistryProjectWebhook } from './helpers/remote-webhook';
import { ApiKey, useLogger } from '../../../config';
import { createBasicHarborAPIClient } from './utils';

export async function linkRegistryProject(
    payload: RegistryProjectLinkPayload,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    const entity = await repository.createQueryBuilder('registryProject')
        .addSelect([
            'registryProject.account_secret',
        ])
        .where('registryProject.id = :id', { id: payload.id })
        .getOne();

    if (!entity) {
        useLogger()
            .error('Registry project not found.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        return;
    }

    if (entity.ecosystem !== Ecosystem.DEFAULT) {
        useLogger()
            .warn('Only default ecosystem supported.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });
        return;
    }

    const registryRepository = dataSource.getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: entity.registry_id })
        .getOne();

    if (!registryEntity) {
        useLogger()
            .error('Registry not found.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        return;
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
    const httpClient = createBasicHarborAPIClient(connectionString);

    useLogger()
        .info('Connect to registry', {
            component: 'registry',
            command: RegistryCommand.PROJECT_LINK,
        });

    try {
        const project = await ensureRemoteRegistryProject(httpClient, {
            remoteId: entity.external_id,
            remoteName: entity.external_name,
            remoteOptions: {
                public: entity.public,
            },
        });

        entity.external_id = project.project_id;
    } catch (e) {
        useLogger()
            .warn('Project could not be created.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        return;
    }

    await repository.save(entity);

    try {
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
    } catch (e) {
        useLogger()
            .warn('Robot account could not be created.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        return;
    }

    await repository.save(entity);

    try {
        const webhook = await saveRemoteRegistryProjectWebhook(httpClient, {
            idOrName: entity.external_name,
            isName: true,
        });

        if (webhook) {
            entity.webhook_name = webhook.name;
            entity.webhook_exists = true;
        }
    } catch (e) {
        useLogger()
            .warn('Webhook could not be created.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        return;
    }

    await repository.save(entity);
}

export async function unlinkRegistryProject(
    payload: RegistryProjectUnlinkPayload,
) {
    const dataSource = await useDataSource();
    const registryRepository = dataSource.getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: payload.registryId })
        .getOne();

    const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
    const httpClient = createBasicHarborAPIClient(connectionString);

    try {
        await httpClient.project
            .delete(payload.externalName, true);
    } catch (e) {
        useLogger()
            .warn('Project could not be deleted.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });
    }

    if (payload.accountId) {
        try {
            await httpClient.robotAccount
                .delete(payload.accountId);
        } catch (e) {
            useLogger()
                .warn('Robot Account could not be deleted.', {
                    component: 'registry',
                    command: RegistryCommand.PROJECT_UNLINK,
                });
        }
    }

    try {
        await useClient<VaultClient>(ApiKey.VAULT)
            .keyValue.delete(REGISTRY_PROJECT_SECRET_ENGINE_KEY, payload.externalName);
    } catch (e) {
        useLogger()
            .warn('Vault project representation could not be deleted.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });
    }

    if (payload.updateDatabase) {
        const projectRepository = dataSource.getRepository(RegistryProjectEntity);
        const project = await projectRepository.findOneBy({ id: payload.id });

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
    payload: RegistryProjectUnlinkPayload,
) {
    await unlinkRegistryProject({
        ...payload,
        updateDatabase: true,
    });

    await linkRegistryProject(payload);
}
