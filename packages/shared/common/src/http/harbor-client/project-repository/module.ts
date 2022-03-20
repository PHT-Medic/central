/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { HarborRepository } from './type';

export class HarborProjectRepositoryAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(projectName: string, repositoryName: string): Promise<HarborRepository | undefined> {
        const result = await this.client.get(`projects/${projectName}/repositories?q=name=~${repositoryName}&=page_size=1`);

        if (result.data.length !== 1) {
            return undefined;
        }

        const item = result.data[0];

        const parts: string[] = item.name.split('/');
        const name: string = parts.pop();

        return {
            id: item.id,
            name,
            fullName: item.name,

            projectId: item.project_id,
            projectName,

            updatedAt: item.update_time,
            createdAt: item.creation_time,
            artifactCount: item.artifact_count,
        };
    }

    async getOne(projectName: string): Promise<HarborRepository[]> {
        const result = await this.client
            .get(`projects/${projectName}/repositories`);

        return result.data.map((item: Record<string, any>) => {
            const parts: string[] = item.name.split('/');
            const name: string = parts.pop();
            const projectName: string = parts.join('/');

            return {
                id: item.id,
                name,
                fullName: item.name,

                projectId: item.project_id,
                projectName,

                updatedAt: item.update_time,
                createdAt: item.creation_time,
                artifactCount: item.artifact_count,
            } as HarborRepository;
        });
    }

    async delete(projectName: string, repositoryName: string) : Promise<void> {
        await this.client
            .get(`projects/${projectName}/repositories/${repositoryName}`);
    }
}
