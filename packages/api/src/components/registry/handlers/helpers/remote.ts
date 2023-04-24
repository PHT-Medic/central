/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import type {
    HarborClient, Project, ProjectCreatePayload,
} from '@hapic/harbor';

export async function ensureRemoteRegistryProject(
    httpClient: HarborClient,
    context: {
        remoteId?: string | number | null,
        remoteName: string,
        remoteOptions?: Partial<ProjectCreatePayload>
    },
) : Promise<Project> {
    const options : ProjectCreatePayload = {
        project_name: context.remoteName,
        public: false,
        ...(context.remoteOptions ? context.remoteOptions : {}),
    };

    try {
        await httpClient.project.create(options);
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 409)) {
            await httpClient.project.update(context.remoteName, options, true);
        }
    }

    const harborProject = await httpClient.project.getOne(context.remoteName, true);

    context.remoteId = `${harborProject.project_id}`;

    return harborProject;
}
