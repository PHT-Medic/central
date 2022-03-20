/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { HarborProjectArtifact, HarborProjectArtifactLabel } from './type';

export class HarborProjectArtifactAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(
        projectName : string,
        repositoryName: string,
    ) : Promise<HarborProjectArtifact[]> {
        const { data } = await this.client
            .get(`projects/${projectName}/repositories/${repositoryName}/artifacts?with_tag=true&with_label=true`);

        return data;
    }

    async copy(
        projectName: string,
        repositoryName: string,
        sourcePath: string,
    ) : Promise<void> {
        await this.client
            .post(`projects/${projectName}/repositories/${repositoryName}/artifacts?from=${sourcePath}`);
    }

    async delete(
        projectName: string,
        repositoryName: string,
        tagOrDigest = 'latest',
    ) {
        await this.client
            .delete(`projects/${projectName}/repositories/${repositoryName}/artifacts/${tagOrDigest}`);
    }

    async createLabel(
        projectName: string,
        repositoryName: string,
        tagOrDigest: string,
        data: HarborProjectArtifactLabel,
    ) : Promise<void> {
        await this.client
            .post(`projects/${projectName}/repositories/${repositoryName}/artifacts/${tagOrDigest}/labels`, data);
    }

    async deleteLabel(
        projectName: string,
        repositoryName: string,
        tagOrDigest: string,
        id: string,
    ) {
        await this.client
            .delete(`projects/${projectName}/repositories/${repositoryName}/artifacts/${tagOrDigest}/labels/${id}`);
    }
}
