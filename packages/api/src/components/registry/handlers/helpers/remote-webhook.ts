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
import {
    ServiceID,
} from '@personalhealthtrain/central-common';
import os from 'node:os';
import { useEnv } from '../../../../config';
import { useAuthupClient } from '../../../../core';
import { findRobotCredentialsInVault } from '../../../../domains';
import { buildRegistryWebhookTarget } from '../utils';

export async function saveRemoteRegistryProjectWebhook(
    httpClient: HarborClient,
    context: {
        idOrName: string | number,
        isName?: boolean
    },
) : Promise<ProjectWebhookPolicyCreateResponse | undefined> {
    await useAuthupClient().robot.integrity(ServiceID.REGISTRY);

    const engineData = await findRobotCredentialsInVault(ServiceID.REGISTRY);

    if (!engineData) {
        return undefined;
    }

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
