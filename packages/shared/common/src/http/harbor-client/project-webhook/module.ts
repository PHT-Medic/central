/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mergeDeep } from '@authelion/common';
import { ClientDriverInstance } from '@trapi/client';
import * as os from 'os';
import { HarborProjectWebhook } from './type';
import { createNanoID } from '../../../utils';

export class HarborProjectWebHookAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(
        projectIdOrName: number | string,
        isProjectName: boolean,
        name : string,
    ): Promise<HarborProjectWebhook | undefined> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const { data } = await this.client
            .get(`projects/${projectIdOrName}/webhook/policies`, headers);

        const policies = data.filter((policy: { name: string; }) => policy.name === name);

        if (policies.length === 1) {
            return policies[0];
        }

        return undefined;
    }

    async ensure(
        projectIdOrName: number | string,
        isProjectName: boolean,
        data: Partial<HarborProjectWebhook>,
    ): Promise<HarborProjectWebhook> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const webhook: HarborProjectWebhook = mergeDeep({
            name: createNanoID(),
            enabled: true,
            targets: [],
            event_types: ['PUSH_ARTIFACT'],
        }, data);

        try {
            await this.client
                .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
        } catch (e) {
            if (e?.response?.status === 409) {
                await this.delete(projectIdOrName, isProjectName, webhook.name);

                await this.client
                    .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
            } else {
                throw e;
            }
        }

        return webhook;
    }

    async delete(projectIdOrName: number | string, isProjectName: boolean, name: string) {
        const webhook = await this.find(projectIdOrName, isProjectName, name);

        if (typeof webhook !== 'undefined') {
            await this.client
                .delete(`projects/${webhook.project_id}/webhook/policies/${webhook.id}`);
        }
    }
}
