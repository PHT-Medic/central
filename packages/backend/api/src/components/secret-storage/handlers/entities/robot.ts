/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI,
    HarborProjectWebhook,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
    Station,
    VaultAPI,
    buildRobotSecretStoragePayload,

} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useClient } from '@trapi/client';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ApiKey } from '../../../../config/api';
import env from '../../../../env';
import {
    SecretStorageRobotQueuePayload,
} from '../../../../domains/special/secret-storage/type';

export async function saveRobotToSecretStorage(payload: SecretStorageRobotQueuePayload) {
    if (!payload.id || !payload.secret) {
        return;
    }

    if (payload.name === ServiceID.REGISTRY) {
        const stationRepository = getRepository(StationEntity);
        const queryBuilder = stationRepository.createQueryBuilder('station');
        const stations = await queryBuilder
            .addSelect('station.registry_project_id')
            .where('station.registry_project_id IS NOT NULL')
            .getMany();

        const promises: Promise<HarborProjectWebhook>[] = stations.map((station: Station) => {
            const promise = useClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(
                station.registry_project_id,
                {
                    id: payload.id,
                    secret: payload.secret,
                },
                { internalAPIUrl: env.internalApiUrl },
            );

            return promise;
        });

        const specialProjects = [
            REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            REGISTRY_INCOMING_PROJECT_NAME,
            REGISTRY_OUTGOING_PROJECT_NAME,
        ];

        specialProjects.map((repository) => {
            promises.push(useClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(repository, {
                id: payload.id,
                secret: payload.secret,
            }, { internalAPIUrl: env.internalApiUrl }, true));

            return repository;
        });

        await Promise.all(promises);
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