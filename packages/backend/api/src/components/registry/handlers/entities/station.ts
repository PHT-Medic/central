/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI,
    HarborProject,
    HarborRobotAccount,
    ROBOT_SECRET_ENGINE_KEY,
    RobotSecretEnginePayload,
    STATION_SECRET_ENGINE_KEY,
    ServiceID,
    StationSecretStoragePayload,
    VaultAPI,
    buildRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { ApiKey } from '../../../../config/api';
import { StationEntity } from '../../../../domains/core/station/entity';
import { RegistryStationQueuePayload } from '../../../../domains/special/registry/type';
import env from '../../../../env';
import { saveStationToSecretStorage } from '../../../secret-storage/handlers/entities/station';
import { SecretStorageQueueEntityType } from '../../../../domains/special/secret-storage/constants';

export async function saveStationToRegistry(payload: RegistryStationQueuePayload) {
    const repository = await getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.registry_project_id',
            'station.registry_project_account_name',
            'station.registry_project_account_token',
            'station.registry_project_webhook_exists',
            'station.public_key',
            'station.secure_id',
        ])
        .where('station.id = :id', { id: payload.id });

    let entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const projectName = buildRegistryStationProjectName(entity.secure_id);

    let harborProject : HarborProject | undefined;

    if (entity.registry_project_id) {
        harborProject = await useClient<HarborAPI>(ApiKey.HARBOR).project.find(entity.registry_project_id);
    }

    if (!harborProject) {
        harborProject = await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
            project_name: projectName,
            public: false,
        });
    }

    entity.registry_project_id = harborProject.id;

    let robotAccount : HarborRobotAccount | undefined;

    if (
        !entity.registry_project_account_id ||
        !entity.registry_project_account_name ||
        !entity.registry_project_account_token
    ) {
        try {
            robotAccount = await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount.create(projectName);
        } catch (e) {
            if (e?.response?.status === 409) {
                const response = await useClient<VaultAPI>(ApiKey.VAULT)
                    .keyValue.find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, entity.secure_id);

                if (response) {
                    entity.registry_project_account_id = response.data.registry_robot_id;
                    entity.registry_project_account_name = response.data.registry_robot_name;
                    entity.registry_project_account_token = response.data.registry_robot_secret;
                }

                if (
                    !entity.registry_project_account_id ||
                    !entity.registry_project_account_name ||
                    !entity.registry_project_account_token
                ) {
                    robotAccount = await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
                        .find(projectName, true);
                }
            }
        }

        if (robotAccount) {
            entity = repository.merge(entity, {
                registry_project_account_name: robotAccount.name,
                registry_project_account_token: robotAccount.secret,
                registry_project_account_id: robotAccount.id,
            });
        }
    }

    if (
        entity.registry_project_account_id
    ) {
        await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
            .update(entity.registry_project_account_id, projectName, {
                name: entity.registry_project_account_name,
            });
    }

    if (
        !entity.registry_project_webhook_exists
    ) {
        const response = await useClient<VaultAPI>(ApiKey.VAULT)
            .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

        if (response) {
            await useClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(projectName, response.data, {
                internalAPIUrl: env.internalApiUrl,
            }, true);

            entity.registry_project_webhook_exists = true;
        }
    }

    await repository.save(entity);

    await saveStationToSecretStorage({
        type: SecretStorageQueueEntityType.STATION,
        id: entity.id,
    });
}

export async function deleteStationFromRegistry(payload: RegistryStationQueuePayload) {
    try {
        const isProjectName = !payload.registry_project_id;
        const id = isProjectName ? buildRegistryStationProjectName(payload.secure_id) : payload.registry_project_id;

        await useClient<HarborAPI>(ApiKey.HARBOR).project
            .delete(id, isProjectName);
    } catch (e) {
        // ...
    }

    if (payload.registry_project_account_id) {
        try {
            await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
                .delete(payload.registry_project_account_id);
        } catch (e) {
            // ...
        }
    }
}