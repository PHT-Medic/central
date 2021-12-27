/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    AuthClientType,
    Client,
    HarborProjectWebhook,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    SERVICE_SECRET_ENGINE_KEY,
    ServiceID,
    Station,
    buildSecretStorageServicePayload,
    ensureHarborProjectWebHook, saveToSecretEngine,
} from '@personalhealthtrain/ui-common';

import { getRepository } from 'typeorm';
import env from '../../env';
import { AuthClientSecurityQueueMessagePayload } from '../../domains/extra/queue';

export async function syncAuthClientSecurity(message: Message) {
    const payload : AuthClientSecurityQueueMessagePayload = message.data as AuthClientSecurityQueueMessagePayload;

    switch (payload.type) {
        case AuthClientType.SERVICE:
            switch (payload.id) {
                case ServiceID.RESULT_SERVICE:
                case ServiceID.TRAIN_BUILDER:
                case ServiceID.TRAIN_ROUTER: {
                    const data = buildSecretStorageServicePayload(payload.clientId, payload.clientSecret);
                    await saveToSecretEngine(SERVICE_SECRET_ENGINE_KEY, payload.id, data);
                    break;
                }
                case ServiceID.REGISTRY: {
                    const stationRepository = getRepository(Station);
                    const queryBuilder = stationRepository.createQueryBuilder('station');
                    const stations = await queryBuilder
                        .addSelect('station.registry_project_id')
                        .where('station.registry_project_id IS NOT NULL')
                        .getMany();

                    // eslint-disable-next-line max-len
                    const promises: Promise<HarborProjectWebhook>[] = stations.map((station: Station) => ensureHarborProjectWebHook(station.registry_project_id, {
                        id: payload.clientId,
                        secret: payload.clientSecret,
                    }, { internalAPIUrl: env.internalApiUrl }));

                    const specialProjects = [
                        REGISTRY_MASTER_IMAGE_PROJECT_NAME,
                        REGISTRY_INCOMING_PROJECT_NAME,
                        REGISTRY_OUTGOING_PROJECT_NAME,
                    ];

                    specialProjects.map((repository) => {
                        promises.push(ensureHarborProjectWebHook(repository, {
                            id: payload.clientId,
                            secret: payload.clientSecret,
                        }, { internalAPIUrl: env.internalApiUrl }, true));

                        return repository;
                    });

                    await Promise.all(promises);
                    break;
                }
            }
            break;
    }

    const repository = getRepository(Client);
    const entity = await repository.findOne(payload.clientId);
    if (typeof entity !== 'undefined') {
        entity.synced = true;

        await repository.save(entity);
    }
}
