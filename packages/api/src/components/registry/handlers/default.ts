/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import type { Registry } from '@personalhealthtrain/central-common';
import {
    Ecosystem,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    RegistryProjectType, generateRegistryProjectId,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import type { RegistryQueuePayload } from '../../../domains/special/registry';
import {
    RegistryQueueCommand,
    buildRegistryPayload,
} from '../../../domains/special/registry';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../domains/core/registry/entity';
import { useLogger } from '../../../config';

export async function setupRegistry(payload: RegistryQueuePayload<RegistryQueueCommand.SETUP>) {
    if (!payload.id && !payload.entity) {
        useLogger()
            .warn('No registry specified.', {
                component: 'registry',
                command: RegistryQueueCommand.SETUP,
            });
        return payload;
    }

    // -----------------------------------------------

    const dataSource = await useDataSource();

    // -----------------------------------------------

    let entity : Registry;

    if (payload.entity) {
        entity = payload.entity;
    } else {
        const repository = dataSource.getRepository(RegistryEntity);
        entity = await repository.findOneBy({ id: payload.id });
    }

    // ---------------------------------------------------------------------

    if (entity.ecosystem !== Ecosystem.DEFAULT) {
        useLogger()
            .warn('Only default ecosystem is supported.', {
                component: 'registry',
                command: RegistryQueueCommand.SETUP,
            });

        return payload;
    }

    // ---------------------------------------------------------------------

    const projectRepository = dataSource.getRepository(RegistryProjectEntity);

    // ---------------------------------------------------------------------

    // incoming
    let incomingEntity = await projectRepository.findOneBy({
        name: REGISTRY_INCOMING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!incomingEntity) {
        incomingEntity = projectRepository.create({
            name: REGISTRY_INCOMING_PROJECT_NAME,
            external_name: generateRegistryProjectId(),
            type: RegistryProjectType.INCOMING,
            registry_id: entity.id,
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
    let outgoingEntity = await projectRepository.findOneBy({
        name: REGISTRY_OUTGOING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!outgoingEntity) {
        outgoingEntity = projectRepository.create({
            name: REGISTRY_OUTGOING_PROJECT_NAME,
            external_name: generateRegistryProjectId(),
            type: RegistryProjectType.OUTGOING,
            registry_id: entity.id,
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
    let masterImagesEntity = await projectRepository.findOneBy({
        external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!masterImagesEntity) {
        masterImagesEntity = projectRepository.create({
            name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME, // todo: can this be generated?
            type: RegistryProjectType.MASTER_IMAGES,
            registry_id: entity.id,
            public: true,
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
        const queueMessage = buildRegistryPayload({
            command: RegistryQueueCommand.PROJECT_LINK,
            data: {
                id: entities[i].id,
            },
        });

        await publish(queueMessage);
    }

    return payload;
}
