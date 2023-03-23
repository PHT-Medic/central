/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as HarborClient, ProjectWebhook } from '@hapic/harbor';
import { useClient as useVaultClient } from '@hapic/vault';
import type { RobotSecretEnginePayload } from '@personalhealthtrain/central-common';
import {
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
} from '@personalhealthtrain/central-common';
import os from 'node:os';

import { useEnv } from '../../../../config';
import { buildRegistryWebhookTarget } from '../utils';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        idOrName: string | number,
        isName?: boolean
    },
) : Promise<ProjectWebhook | undefined> {
    const response = await useVaultClient()
        .keyValue.find<RobotSecretEnginePayload>(ROBOT_SECRET_ENGINE_KEY, ServiceID.REGISTRY);

    if (response) {
        const webhookData : Partial<ProjectWebhook> = {
            name: os.hostname(),
            targets: [
                buildRegistryWebhookTarget({
                    url: useEnv('apiUrl'),
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
