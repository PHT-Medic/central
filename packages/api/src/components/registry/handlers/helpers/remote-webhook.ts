/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import type {
    HarborClient, ProjectWebhookPolicyCreateContext, ProjectWebhookPolicyCreateResponse,
} from '@hapic/harbor';
import { useClient as useVaultClient } from '@hapic/vault';
import type { RobotSecretEnginePayload } from '@personalhealthtrain/central-common';
import {
    ROBOT_SECRET_ENGINE_KEY,
    ServiceID,
} from '@personalhealthtrain/central-common';
import os from 'node:os';

import { useEnv } from '../../../../config';
import { useAuthupClient } from '../../../../core';
import { buildRegistryWebhookTarget } from '../utils';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        idOrName: string | number,
        isName?: boolean
    },
) : Promise<ProjectWebhookPolicyCreateResponse | undefined> {
    await useAuthupClient().robot.integrity(ServiceID.REGISTRY);

    let engineData : RobotSecretEnginePayload | undefined;

    try {
        const response = await useVaultClient()
            .keyValueV1.getOne<RobotSecretEnginePayload>({
                mount: ROBOT_SECRET_ENGINE_KEY,
                path: ServiceID.REGISTRY,
        });

        if (response && response.data) {
            engineData = response.data;
        }
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    if (engineData) {
        const webhookData: ProjectWebhookPolicyCreateContext = {
            data: {
                enabled: true, // todo: maybe add more event_types
                name: os.hostname(),
                targets: [
                    buildRegistryWebhookTarget({
                        url: useEnv('apiUrl'),
                        robot: {
                            id: engineData.id,
                            secret: engineData.secret,
                        },
                    }),
                ],
            },
            projectIdOrName: context.idOrName,
            isProjectName: context.isName,
        };

        try {
            const response = await httpClient
                .projectWebhookPolicy
                .create(webhookData);

            return {
                id: response.id,
            };
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 409)) {
                const webhook = await httpClient.projectWebhookPolicy.findOne({
                    name: os.hostname(),
                    projectIdOrName: context.idOrName,
                    isProjectName: context.isName,
                });

                await httpClient.projectWebhookPolicy.update({
                    ...webhookData,
                    id: webhook.id,
                });

                return {
                    id: webhook.id,
                };
            }

            throw e;
        }
    }

    return undefined;
}
