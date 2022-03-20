import { URL } from 'url';
import { parseHarborConnectionString } from '@personalhealthtrain/central-common';
import env from '../../env';
import { DockerAuthConfig } from '../../modules/docker';

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

export function buildRemoteDockerImageURL(
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string,
): string {
    let basePath = [
        harborUrL.hostname,
        projectName,
        repositoryName,
    ].join('/');

    if (tagOrDigest) {
        basePath += tagOrDigest.startsWith('sha') ?
            `@${tagOrDigest}` :
            `:${tagOrDigest}`;
    }

    return basePath;
}

export function buildDockerAuthConfig() : DockerAuthConfig {
    return {
        username: harborConfig.user,
        password: harborConfig.password,
        serveraddress: harborUrL.hostname,
    };
}
