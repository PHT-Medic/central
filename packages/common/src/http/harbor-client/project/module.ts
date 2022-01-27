/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { HarborProject, HarborProjectCreateContext } from './type';

export class HarborProjectAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(id: string | number, isProjectName = false): Promise<HarborProject> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        try {
            const { data } = await this.client
                .get(`projects/${id}`);

            return {
                name: data.name,
                id: data.project_id,
            };
        } catch (e) {
            if (e.response.status === 404) {
                return undefined;
            }

            throw e;
        }
    }

    async save(data: HarborProjectCreateContext) {
        try {
            await this.client
                .post('projects', data);

            return await this.find(data.project_name, true);
        } catch (e) {
            if (e.response.status === 409) {
                return this.find(data.project_name, true);
            }

            throw e;
        }
    }

    async delete(id: string | number, isProjectName = false) {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        await this.client
            .delete(`projects/${id}`, headers);
    }
}
