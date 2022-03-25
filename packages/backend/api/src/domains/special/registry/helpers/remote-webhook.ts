/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClientKey,
    HarborAPI, HarborProjectWebhook,
    ROBOT_SECRET_ENGINE_KEY,
    RobotSecretEnginePayload,
    ServiceID, VaultAPI,
    buildRegistryWebhookTarget,
} from '@personalhealthtrain/central-common';
import os from 'os';
import { useClient } from '@trapi/client';
import env from '../../../../env';

export async function ensureRemoteRegistryProjectWebhook(
    httpClient: HarborAPI,
    context: {
        idOrName: string | number,
        isName?: boolean
    },
) : Promise<HarborProjectWebhook | undefined> {
    const response = await useClient<VaultAPI>(HTTPClientKey.VAULT)
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (response) {
        const webhookData : Partial<HarborProjectWebhook> = {
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
            .ensure(context.idOrName, context.isName, webhookData);
    }

    return undefined;
}
