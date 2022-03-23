/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import {
    HarborAPI,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    ROBOT_SECRET_ENGINE_KEY,
    Registry,
    RegistryProjectType,
    RobotSecretEnginePayload,
    ServiceID,
    VaultAPI,
    buildConnectionStringFromRegistry, createBasicHarborAPIConfig,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { ApiKey } from '../../../config/api';
import {
    RegistryQueueCommand,
    RegistryQueuePayload,
    buildRegistryQueueMessage,
} from '../../../domains/special/registry';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../domains/core/registry/entity';
import { ensureRemoteRegistryProject } from '../../../domains/special/registry/helpers/remote';
import { ensureRemoteRegistryProjectWebhook } from '../../../domains/special/registry/helpers/remote-webhook';

export async function setupRegistry(payload: RegistryQueuePayload<RegistryQueueCommand.SETUP>) {
    const response = await useClient<VaultAPI>(ApiKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (!response) {
        return payload;
    }

    // -----------------------------------------------

    let entity : Registry;

    if (payload.entity) {
        entity = payload.entity;
    } else {
        const repository = getRepository(RegistryEntity);
        entity = await repository.createQueryBuilder('registry')
            .addSelect([
                'registry.address',
                'registry.account_name',
                'registry.account_token',
            ])
            .where('registryProject.id = :id', { id: payload.entityId })
            .getOne();
    }

    const connectionString = buildConnectionStringFromRegistry(entity);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    // ---------------------------------------------------------------------

    const projectRepository = getRepository(RegistryProjectEntity);

    // ---------------------------------------------------------------------

    // incoming
    const incoming = await ensureRemoteRegistryProject(httpClient, {
        remoteName: REGISTRY_INCOMING_PROJECT_NAME,
        remoteOptions: {
            public: false,
        },
    });

    await ensureRemoteRegistryProjectWebhook(httpClient, {
        idOrName: incoming.id,
        isName: false,
    });

    let incomingEntity = await projectRepository.findOne({
        external_name: incoming.name,
    });
    if (typeof incomingEntity === 'undefined') {
        incomingEntity = projectRepository.create({
            name: incoming.name,
            external_name: incoming.name,
            external_id: `${incoming.id}`,
            webhook_exists: true,
            type: RegistryProjectType.INCOMING,
        });
    } else {
        incomingEntity = projectRepository.merge(incomingEntity, {
            external_id: `${incoming.id}`,
            webhook_exists: true,
        });
    }
    await projectRepository.save(incomingEntity);

    // ---------------------------------------------------------------------

    // outgoing
    const outgoing = await ensureRemoteRegistryProject(httpClient, {
        remoteName: REGISTRY_OUTGOING_PROJECT_NAME,
        remoteOptions: {
            public: false,
        },
    });

    await ensureRemoteRegistryProjectWebhook(httpClient, {
        idOrName: outgoing.id,
        isName: false,
    });

    let outgoingEntity = await projectRepository.findOne({
        external_name: outgoing.name,
    });
    if (typeof outgoingEntity === 'undefined') {
        outgoingEntity = projectRepository.create({
            name: outgoing.name,
            external_name: outgoing.name,
            external_id: `${outgoing.id}`,
            webhook_exists: true,
            type: RegistryProjectType.OUTGOING,
        });
    } else {
        outgoingEntity = projectRepository.merge(outgoingEntity, {
            external_id: `${outgoing.id}`,
            webhook_exists: true,
        });
    }
    await projectRepository.save(outgoingEntity);

    // -----------------------------------------------------------------------

    // master ( images )
    const masterImages = await ensureRemoteRegistryProject(httpClient, {
        remoteName: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        remoteOptions: {
            public: false,
        },
    });

    let masterImagesEntity = await projectRepository.findOne({
        external_name: masterImages.name,
    });
    if (typeof masterImagesEntity === 'undefined') {
        masterImagesEntity = projectRepository.create({
            name: masterImages.name,
            external_name: masterImages.name,
            external_id: `${masterImages.id}`,
            type: RegistryProjectType.MASTER_IMAGES,
        });
    } else {
        masterImagesEntity = projectRepository.merge(masterImagesEntity, {
            external_id: `${masterImages.id}`,
        });
    }
    await projectRepository.save(masterImagesEntity);

    // -----------------------------------------------

    const entities = await projectRepository.find({
        registry_id: entity.id,
    });
    for (let i = 0; i < entities.length; i++) {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_SETUP,
            {
                entityId: entities[i].id,
            },
        );

        await publishMessage(queueMessage);
    }

    return payload;
}
