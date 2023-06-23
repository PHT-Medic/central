/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { Ecosystem, buildRegistryClientConnectionStringFromRegistry } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../../config';
import { RegistryEntity, RegistryProjectEntity } from '../../../../domains';
import { RegistryCommand } from '../../constants';
import type { RegistryProjectLinkPayload } from '../../type';
import { ensureRemoteRegistryProject } from '../helpers/remote';
import { ensureRemoteRegistryProjectAccount } from '../helpers/remote-robot-account';
import { saveRemoteRegistryProjectWebhook } from '../helpers/remote-webhook';
import { createBasicHarborAPIClient } from '../utils';

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

    try {
        const project = await ensureRemoteRegistryProject(httpClient, {
            remoteId: entity.external_id,
            remoteName: entity.external_name,
            remoteOptions: {
                public: entity.public,
            },
        });

        entity.external_id = `${project.project_id}`;
    } catch (e) {
        useLogger()
            .warn('Project could not be created.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        throw e;
    }

    await repository.save(entity);

    try {
        const robotAccount = await ensureRemoteRegistryProjectAccount(httpClient, {
            name: entity.external_name,
            account: {
                id: parseInt(entity.account_id, 10),
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

        throw e;
    }

    await repository.save(entity);

    try {
        const webhook = await saveRemoteRegistryProjectWebhook(
            httpClient,
            {
                projectIdOrName: entity.external_name,
                isProjectName: true,
            },
        );

        // webhook.id is also present :)
        entity.webhook_name = `${webhook.id}`;
        entity.webhook_exists = true;
    } catch (e) {
        useLogger()
            .warn('Webhook could not be created.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

        throw e;
    }

    await repository.save(entity);
}
