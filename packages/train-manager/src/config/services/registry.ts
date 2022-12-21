/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getHostNameFromString } from '@personalhealthtrain/central-common';
import { ConnectionConfig } from '@hapic/harbor';
import { DockerAuthConfig } from '../../modules/docker';

type RemoteDockerImageURLBuildContext = {
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string,

    hostname: string
};

export function buildRemoteDockerImageURL(context: RemoteDockerImageURLBuildContext): string {
    let basePath = [
        getHostNameFromString(context.hostname),
        context.projectName,
        context.repositoryName,
    ].join('/');

    if (context.tagOrDigest) {
        basePath += context.tagOrDigest.startsWith('sha') ?
            `@${context.tagOrDigest}` :
            `:${context.tagOrDigest}`;
    }

    return basePath;
}

export function buildDockerAuthConfig(config: ConnectionConfig) : DockerAuthConfig {
    return {
        username: config.user,
        password: config.password,
        serveraddress: getHostNameFromString(config.host),
    };
}
