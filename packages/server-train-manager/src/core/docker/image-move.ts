/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildRemoteDockerImageURL } from './registry';
import { pushDockerImage } from './image-push';
import type { DockerAuthConfig } from './index';
import { pullDockerImage, removeDockerImage, useDocker } from './index';

type DockerBaseImageBuildContext = {
    sourceTag: string,
    sourceProjectName: string,
    sourceRepositoryName: string,
    sourceAuthConfig: DockerAuthConfig,
    sourceRemove?: boolean

    destinationTag?: string,
    destinationProjectName?: string,
    destinationRepositoryName?: string,
    destinationAuthConfig?: DockerAuthConfig
};

export async function moveDockerImage(context: DockerBaseImageBuildContext) {
    const sourceImageURL = buildRemoteDockerImageURL({
        hostname: context.sourceAuthConfig.serveraddress,
        projectName: context.sourceProjectName,
        repositoryName: context.sourceRepositoryName,
        tagOrDigest: context.sourceTag,
    });

    await pullDockerImage(sourceImageURL, context.sourceAuthConfig);

    // ------------------------------------------------------------

    const destinationAuthConfig = context.destinationAuthConfig || context.sourceAuthConfig;
    const destinationTag = context.destinationTag || context.sourceTag;

    const destinationImageURL = buildRemoteDockerImageURL({
        hostname: destinationAuthConfig.serveraddress,
        projectName: context.destinationProjectName || context.sourceProjectName,
        repositoryName: context.destinationRepositoryName || context.sourceRepositoryName,
    });

    const image = useDocker().getImage(sourceImageURL);
    await image.tag({
        repo: destinationImageURL,
        tag: destinationTag,
    });

    await pushDockerImage(`${destinationImageURL}:${destinationTag}`, destinationAuthConfig);

    // ------------------------------------------------------------

    await removeDockerImage(sourceImageURL);
    await removeDockerImage(`${destinationImageURL}:${destinationTag}`);
}
