/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HarborAPI,
    REGISTRY_INCOMING_PROJECT_NAME, REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME, ROBOT_SECRET_ENGINE_KEY, RobotSecretEnginePayload,
    ServiceID, VaultAPI,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import env from '../../../env';
import { ApiKey } from '../../../config/api';

export async function setupRegistry(message?: Message) {
    const response = await useClient<VaultAPI>(ApiKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (!response) {
        return;
    }

    // -----------------------------------------------

    // incoming
    const incomingEntity = await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_INCOMING_PROJECT_NAME,
        public: false,
    });

    await useClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(incomingEntity.id, response.data, {
        internalAPIUrl: env.internalApiUrl,
    });

    // outgoing
    const outgoingEntity = await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_OUTGOING_PROJECT_NAME,
        public: false,
    });

    await useClient<HarborAPI>(ApiKey.HARBOR).projectWebHook.ensure(outgoingEntity.id, response.data, {
        internalAPIUrl: env.internalApiUrl,
    });

    // master ( images )
    await useClient<HarborAPI>(ApiKey.HARBOR).project.save({
        project_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        public: false,
    });
}
