/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import {
    Ecosystem,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    ROBOT_SECRET_ENGINE_KEY,
    Registry,
    RegistryProjectType,
    RobotSecretEnginePayload,
    ServiceID,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { VaultClient } from '@trapi/vault-client';
import { ApiKey } from '../../../config/api';
import {
    RegistryQueueCommand,
    RegistryQueuePayload,
    buildRegistryQueueMessage,
} from '../../../domains/special/registry';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../domains/core/registry/entity';
import { useLogger } from '../../../config/log';

export async function setupRegistry(payload: RegistryQueuePayload<RegistryQueueCommand.SETUP>) {
    const response = await useClient<VaultClient>(ApiKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (!response) {
        useLogger()
            .warn('Registry setup failed. No robot credentials present in secret storage.', {
                component: 'registry',
            });
        return payload;
    }

    if (!payload.id && !payload.entity) {
        useLogger()
            .warn('Registry setup failed. No registry specified.', {
                component: 'registry',
            });
        return payload;
    }

    // -----------------------------------------------

    let entity : Registry;

    if (payload.entity) {
        entity = payload.entity;
    } else {
        const repository = getRepository(RegistryEntity);
        entity = await repository.findOne(payload.id);
    }

    // ---------------------------------------------------------------------

    if (entity.ecosystem !== Ecosystem.DEFAULT) {
        useLogger()
            .warn('Registry setup aborted. Only default ecosystem supported.', {
                component: 'registry',
            });

        return payload;
    }

    // ---------------------------------------------------------------------

    const projectRepository = getRepository(RegistryProjectEntity);

    // ---------------------------------------------------------------------

    // incoming
    let incomingEntity = await projectRepository.findOne({
        external_name: REGISTRY_INCOMING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (typeof incomingEntity === 'undefined') {
        incomingEntity = projectRepository.create({
            name: REGISTRY_INCOMING_PROJECT_NAME,
            external_name: REGISTRY_INCOMING_PROJECT_NAME,
            type: RegistryProjectType.INCOMING,
            registry_id: entity.id,
            realm_id: entity.realm_id,
            public: false,
        });
    } else {
        incomingEntity = projectRepository.merge(incomingEntity, {
            public: false,
        });
    }
    await projectRepository.save(incomingEntity);

    // ---------------------------------------------------------------------

    // outgoing
    let outgoingEntity = await projectRepository.findOne({
        external_name: REGISTRY_OUTGOING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (typeof outgoingEntity === 'undefined') {
        outgoingEntity = projectRepository.create({
            name: REGISTRY_OUTGOING_PROJECT_NAME,
            external_name: REGISTRY_OUTGOING_PROJECT_NAME,
            type: RegistryProjectType.OUTGOING,
            registry_id: entity.id,
            realm_id: entity.realm_id,
            public: false,
        });
    } else {
        outgoingEntity = projectRepository.merge(outgoingEntity, {
            public: false,
        });
    }
    await projectRepository.save(outgoingEntity);

    // -----------------------------------------------------------------------

    // master ( images )
    let masterImagesEntity = await projectRepository.findOne({
        external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (typeof masterImagesEntity === 'undefined') {
        masterImagesEntity = projectRepository.create({
            name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            type: RegistryProjectType.MASTER_IMAGES,
            registry_id: entity.id,
            realm_id: entity.realm_id,
            public: false,
        });
    } else {
        masterImagesEntity = projectRepository.merge(masterImagesEntity, {
            public: false,
        });
    }
    await projectRepository.save(masterImagesEntity);

    // -----------------------------------------------

    const entities = await projectRepository.find({
        where: {
            registry_id: entity.id,
        },
        select: ['id'],
    });

    for (let i = 0; i < entities.length; i++) {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_LINK,
            {
                id: entities[i].id,
            },
        );

        await publishMessage(queueMessage);
    }

    return payload;
}
