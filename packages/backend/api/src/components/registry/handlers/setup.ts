/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import {
    HarborAPI,
    HarborProjectWebhook, REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME, REGISTRY_OUTGOING_PROJECT_NAME,
    ROBOT_SECRET_ENGINE_KEY, RobotSecretEnginePayload, ServiceID,
    VaultAPI, buildRegistryWebhookTarget,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { getRepository } from 'typeorm';
import os from 'os';
import env from '../../../env';
import { ApiKey } from '../../../config/api';
import { StationEntity } from '../../../domains/core/station/entity';
import {
    RegistryQueueCommand,
    RegistryQueueEntityType,
    buildRegistryQueueMessage,
} from '../../../domains/special/registry';

export async function setupRegistry(message?: Message) {
    const response = await useClient<VaultAPI>(ApiKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (!response) {
        return message;
    }

    const webhookData : Partial<HarborProjectWebhook> = {
        name: os.hostname(),
        targets: [
            buildRegistryWebhookTarget({
                apiUrl: env.apiUrl,
                robot: {
                    id: response.data.id,
                    secret: response.data.secret,
                },
            }),

        ],
    };

    // -----------------------------------------------

    // incoming
    const incomingEntity = await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_INCOMING_PROJECT_NAME,
        public: false,
    });

    await useClient<HarborAPI>(ApiKey.HARBOR)
        .projectWebHook
        .ensure(incomingEntity.id, false, webhookData);

    // outgoing
    const outgoingEntity = await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_OUTGOING_PROJECT_NAME,
        public: false,
    });

    await useClient<HarborAPI>(ApiKey.HARBOR)
        .projectWebHook
        .ensure(outgoingEntity.id, false, webhookData);

    // master ( images )
    await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        public: false,
    });

    // -----------------------------------------------

    const repository = await getRepository(StationEntity);
    const query = repository.createQueryBuilder('station');

    const entities = await query.getMany();
    for (let i = 0; i < entities.length; i++) {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.SAVE,
            {
                type: RegistryQueueEntityType.STATION,
                id: entities[i].id,
            },
        );
        await publishMessage(queueMessage);
    }

    return message;
}
