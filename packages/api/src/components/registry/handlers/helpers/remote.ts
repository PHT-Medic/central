/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Client as HarborClient, Project, ProjectPayload,
} from '@hapic/harbor';

export async function ensureRemoteRegistryProject(
    httpClient: HarborClient,
    context: {
        remoteId?: string | number | null,
        remoteName: string,
        remoteOptions?: Partial<ProjectPayload>
    },
) : Promise<Project> {
    await httpClient.project.save({
        project_name: context.remoteName,
        public: false,
        ...(context.remoteOptions ? context.remoteOptions : {}),
    });

    const harborProject : Project = await httpClient.project.getOne(context.remoteName, true);

    context.remoteId = `${harborProject.project_id}`;

    return harborProject;
}
