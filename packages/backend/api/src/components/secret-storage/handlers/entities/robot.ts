/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    VaultAPI,
    buildRobotSecretStoragePayload,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { ApiKey } from '../../../../config/api';
import { SecretStorageRobotQueuePayload } from '../../../../domains/special/secret-storage/type';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../domains/special/registry';
import { RegistryEntity } from '../../../../domains/core/registry/entity';

export async function saveRobotToSecretStorage(payload: SecretStorageRobotQueuePayload) {
    if (!payload.id || !payload.secret) {
        return;
    }

    if (payload.name === ServiceID.REGISTRY) {
        const registryRepository = getRepository(RegistryEntity);
        const registries = await registryRepository.find({
            select: ['id'],
        });

        for (let i = 0; i < registries.length; i++) {
            const queueMessage = buildRegistryQueueMessage(
                RegistryQueueCommand.SETUP,
                {
                    id: registries[i].id,
                },
            );

            await publishMessage(queueMessage);
        }
    }

    const data = buildRobotSecretStoragePayload(payload.id, payload.secret);
    await useClient<VaultAPI>(ApiKey.VAULT).keyValue.save(ROBOT_SECRET_ENGINE_KEY, `${payload.name}`, data);
}

export async function deleteRobotFromSecretStorage(payload: SecretStorageRobotQueuePayload) {
    try {
        await useClient<VaultAPI>(ApiKey.VAULT).keyValue.delete(ROBOT_SECRET_ENGINE_KEY, `${payload.name}`);
    } catch (e) {
        // ...
    }
}
