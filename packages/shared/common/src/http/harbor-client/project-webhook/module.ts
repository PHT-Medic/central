/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot } from '@typescript-auth/domains';
import { ClientDriverInstance, stringifyAuthorizationHeader } from '@trapi/client';
import { HarborProjectWebhook, HarborProjectWebhookOptions } from './type';
import { ServiceID } from '../../../domains';

const WEBHOOK_ID = 'UI';

export class HarborProjectWebHookAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(
        projectIdOrName: number | string,
        isProjectName = false,
    ): Promise<HarborProjectWebhook | undefined> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const { data } = await this.client
            .get(`projects/${projectIdOrName}/webhook/policies`, headers);

        const policies = data.filter((policy: { name: string; }) => policy.name === WEBHOOK_ID);

        if (policies.length === 1) {
            return policies[0];
        }

        return undefined;
    }

    async ensure(
        projectIdOrName: number | string,
        client: Pick<Robot, 'id' | 'secret'>,
        options: HarborProjectWebhookOptions,
        isProjectName = false,
    ): Promise<HarborProjectWebhook> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const apiUrl: string | undefined = options.internalAPIUrl ?? options.externalAPIUrl;
        if (!apiUrl) {
            throw new Error('An API Harbor URL must be specified.');
        }

        const webhook: HarborProjectWebhook = {
            name: WEBHOOK_ID,
            enabled: true,
            targets: [
                {
                    auth_header: stringifyAuthorizationHeader({
                        type: 'Basic',
                        username: client.id,
                        password: client.secret,
                    }),
                    skip_cert_verify: true,
                    // todo: change this, if service not on same machine.
                    address: `${apiUrl}services/${ServiceID.REGISTRY}/hook`,
                    type: 'http',
                },
            ],
            event_types: ['PUSH_ARTIFACT'],
        };

        try {
            await this.client
                .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
        } catch (e) {
            if (e?.response?.status === 409) {
                await this.delete(projectIdOrName, isProjectName);

                await this.client
                    .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
            } else {
                throw e;
            }
        }

        return webhook;
    }

    async delete(projectIdOrName: number | string, isProjectName = false) {
        const webhook = await this.find(projectIdOrName, isProjectName);

        if (typeof webhook !== 'undefined') {
            await this.client
                .delete(`projects/${webhook.project_id}/webhook/policies/${webhook.id}`);
        }
    }
}
