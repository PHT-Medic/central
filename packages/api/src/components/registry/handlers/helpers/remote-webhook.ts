/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import type {
    HarborClient, ProjectWebhookPolicyCreateContext,
} from '@hapic/harbor';
import {
    ServiceID,
} from '@personalhealthtrain/central-common';
import { useEnv, useLogger } from '../../../../config';
import { useAuthupClient } from '../../../../core';
import { findRobotCredentialsInVault } from '../../../../domains';
import { buildRegistryWebhookTarget } from '../utils';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        projectIdOrName: string,
        isProjectName?: boolean
    },
) : Promise<{ id: number } | undefined> {
    await useAuthupClient().robot.integrity(ServiceID.REGISTRY);

    const engineData = await findRobotCredentialsInVault(ServiceID.REGISTRY);

    if (!engineData) {
        useLogger().warn('No robot credentials could be found in vault for the registry project.');
        return undefined;
    }

    const webhookData: ProjectWebhookPolicyCreateContext = {
        data: {
            enabled: true,
            name: 'api',
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
        projectIdOrName: context.projectIdOrName,
        isProjectName: context.isProjectName,
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
                name: 'api',
                projectIdOrName: context.projectIdOrName,
                isProjectName: context.isProjectName,
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
