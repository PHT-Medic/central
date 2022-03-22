/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { URL } from 'url';
import { APIServiceHarborConfig, parseHarborConnectionString } from '@personalhealthtrain/central-common';
import env from '../../env';
import { DockerAuthConfig } from '../../modules/docker';

const harborDefaultConfig = parseHarborConnectionString(env.harborConnectionString);

type RemoteDockerImageURLBuildContext = {
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string,

    hostname?: string
};

export function buildRemoteDockerImageURL(context: RemoteDockerImageURLBuildContext): string {
    let hostname = context.hostname || harborDefaultConfig.host;

    if (
        hostname.startsWith('http://') ||
        hostname.startsWith('https://')
    ) {
        const url = new URL(hostname);
        hostname = url.hostname;
    }

    let basePath = [
        hostname,
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

export function buildDockerAuthConfig(config?: APIServiceHarborConfig) : DockerAuthConfig {
    config = config || harborDefaultConfig;
    const url = new URL(config.host);

    return {
        username: config.user,
        password: config.password,
        serveraddress: url.hostname,
    };
}
