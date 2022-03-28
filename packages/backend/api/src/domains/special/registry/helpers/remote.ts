/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborClient, HarborProject,
    HarborProjectCreateContext,
} from '@trapi/harbor-client';

export async function ensureRemoteRegistryProject(
    httpClient: HarborClient,
    context: {
        remoteId?: string | number | null,
        remoteName: string,
        remoteOptions?: Partial<HarborProjectCreateContext>
    },
) : Promise<HarborProject> {
    let harborProject : HarborProject | undefined;

    if (context.remoteId) {
        harborProject = await httpClient.project.find(context.remoteId);
    }

    if (!harborProject) {
        harborProject = await httpClient.project.save({
            project_name: context.remoteName,
            public: false,
            ...(context.remoteOptions ? context.remoteOptions : {}),
        });
    }

    context.remoteId = `${harborProject.id}`;

    return harborProject;
}
