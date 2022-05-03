/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborClient, ProjectWebhook } from '@trapi/harbor-client';
import {
    HTTPClientKey,
    ROBOT_SECRET_ENGINE_KEY,
    RobotSecretEnginePayload,
    ServiceID,
} from '@personalhealthtrain/central-common';
import os from 'os';
import { useClient } from '@trapi/client';
import { VaultClient } from '@trapi/vault-client';
import env from '../../../../env';
import { buildRegistryWebhookTarget } from '../utils';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        idOrName: string | number,
        isName?: boolean
    },
) : Promise<ProjectWebhook | undefined> {
    const response = await useClient<VaultClient>(HTTPClientKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (response) {
        const webhookData : Partial<ProjectWebhook> = {
            name: os.hostname(),
            targets: [
                buildRegistryWebhookTarget({
                    url: env.apiUrl,
                    robot: {
                        id: response.data.id,
                        secret: response.data.secret,
                    },
                }),

            ],
        };

        return httpClient
            .projectWebHook
            .save(context.idOrName, context.isName, webhookData);
    }

    return undefined;
}
