/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem, REGISTRY_ARTIFACT_TAG_BASE, parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import { ProjectRepositoryExternalTransferItem, ProjectRepositoryTransferItem } from './type';
import { pullDockerImage, useDocker } from '../../../modules/docker';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../../config/services/registry';
import env from '../../../env';
import { pushDockerImage } from '../../../modules/docker/image-push';

export async function transferProjectRepositoryToOtherEcosystem(
    source: ProjectRepositoryTransferItem,
    destination: ProjectRepositoryExternalTransferItem,
) {
    const sourceArtifactTag = source.artifactTag || 'latest';

    if (sourceArtifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        // don't move base tag to external ... ^^
        return;
    }

    const imageURL = buildRemoteDockerImageURL({
        projectName: source.projectName,
        repositoryName: source.repositoryName,
        tagOrDigest: sourceArtifactTag,
    });

    switch (destination.stationExtended.ecosystem) {
        case Ecosystem.PADME: {
            const aachenHarborConfig = parseHarborConnectionString(env.aachenHarborConnectionString);

            await pullDockerImage(
                imageURL,
                buildDockerAuthConfig(),
            );

            const image = await useDocker().getImage(imageURL);
            await image.tag({
                repo: buildRemoteDockerImageURL({
                    projectName: env.aachenHarborProjectName,
                    repositoryName: destination.repositoryName,
                    hostname: aachenHarborConfig.host,
                }),
                tag: 'latest',
            });

            await pushDockerImage(image, buildDockerAuthConfig(aachenHarborConfig));

            break;
        }
        default:
            // not supported :/
            break;
    }
}
