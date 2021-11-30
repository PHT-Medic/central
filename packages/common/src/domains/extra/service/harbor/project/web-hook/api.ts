/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { stringifyAuthorizationHeader } from '@typescript-auth/core';

import { Client } from '../../../../../auth';
import { APIType, useAPI } from '../../../../../../modules';
import { SERVICE_ID } from '../../../type';
import { HarborProjectWebhook, HarborProjectWebhookOptions } from './type';

const WEBHOOK_ID = 'UI';

export async function findHarborProjectWebHook(
    projectIdOrName: number | string,
    isProjectName = false,
) : Promise<HarborProjectWebhook | undefined> {
    const headers : Record<string, any> = {};

    if (isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    const { data } = await useAPI(APIType.HARBOR)
        .get(`projects/${projectIdOrName}/webhook/policies`, headers);

    const policies = data.filter((policy: { name: string; }) => policy.name === WEBHOOK_ID);

    if (policies.length === 1) {
        return policies[0];
    }

    return undefined;
}

export async function ensureHarborProjectWebHook(
    projectIdOrName: number | string,
    client: Pick<Client, 'id' | 'secret'>,
    options: HarborProjectWebhookOptions,
    isProjectName = false,
) : Promise<HarborProjectWebhook> {
    const headers : Record<string, any> = {};

    if (isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    const apiUrl : string | undefined = options.internalAPIUrl ?? options.externalAPIUrl;
    if (!apiUrl) {
        throw new Error('An API Harbor URL must be specified.');
    }

    const webhook: HarborProjectWebhook = {
        name: WEBHOOK_ID,
        enabled: true,
        targets: [
            {
                auth_header: stringifyAuthorizationHeader({ type: 'Basic', username: client.id, password: client.secret }),
                skip_cert_verify: true,
                // todo: change this, if service not on same machine.
                address: `${apiUrl}services/${SERVICE_ID.REGISTRY}/hook`,
                type: 'http',
            },
        ],
        event_types: ['PUSH_ARTIFACT'],
    };

    try {
        await useAPI(APIType.HARBOR)
            .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
    } catch (e) {
        if (e?.response?.status === 409) {
            await dropHarborProjectWebHook(projectIdOrName, isProjectName);

            await useAPI(APIType.HARBOR)
                .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);

            return;
        }

        throw e;
    }

    return webhook;
}

export async function dropHarborProjectWebHook(projectIdOrName: number | string, isProjectName = false) {
    const webhook = await findHarborProjectWebHook(projectIdOrName, isProjectName);

    if (typeof webhook !== 'undefined') {
        await useAPI(APIType.HARBOR)
            .delete(`projects/${webhook.project_id}/webhook/policies/${webhook.id}`);
    }
}
