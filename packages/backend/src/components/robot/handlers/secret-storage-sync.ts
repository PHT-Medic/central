/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HarborAPI,
    HarborProjectWebhook,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID, Station, VaultAPI, buildSecretStorageServicePayload,
} from '@personalhealthtrain/ui-common';

import { getRepository } from 'typeorm';
import { useTrapiClient } from '@trapi/client';
import env from '../../../env';
import { ServiceQueueMessagePayload } from '../../../domains/auth/service/type';
import { StationEntity } from '../../../domains/core/station/entity';
import { ApiKey } from '../../../config/api';

export async function syncRobotToSecretStorage(message: Message) {
    const payload : ServiceQueueMessagePayload = message.data as ServiceQueueMessagePayload;

    switch (payload.id) {
        case ServiceID.REGISTRY: {
            const stationRepository = getRepository(StationEntity);
            const queryBuilder = stationRepository.createQueryBuilder('station');
            const stations = await queryBuilder
                .addSelect('station.registry_project_id')
                .where('station.registry_project_id IS NOT NULL')
                .getMany();

            const promises: Promise<HarborProjectWebhook>[] = stations.map((station: Station) => {
                const promise = useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(
                    station.registry_project_id,
                    {
                        id: payload.robotId,
                        secret: payload.robotSecret,
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
                promises.push(useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(repository, {
                    id: payload.robotId,
                    secret: payload.robotSecret,
                }, { internalAPIUrl: env.internalApiUrl }, true));

                return repository;
            });

            await Promise.all(promises);
            break;
        }
        default: {
            const data = buildSecretStorageServicePayload(payload.robotId, payload.robotSecret);
            await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(ROBOT_SECRET_ENGINE_KEY, `${payload.id}`, data);
            break;
        }
    }
}
