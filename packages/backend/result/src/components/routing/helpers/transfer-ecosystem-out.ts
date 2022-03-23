/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { TransferItem } from './type';
import { pullDockerImage, useDocker } from '../../../modules/docker';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../../config/services/registry';
import { pushDockerImage } from '../../../modules/docker/image-push';

export async function transferEcosystemOut(
    source: TransferItem,
    destination: TransferItem,
) {
    const sourceArtifactTag = source.artifactTag || 'latest';

    if (
        sourceArtifactTag === REGISTRY_ARTIFACT_TAG_BASE ||
        destination.project.ecosystem === Ecosystem.DEFAULT
    ) {
        // don't move base tag to external ... ^^
        return;
    }

    const client = await useClient<HTTPClient>();

    // ------------------------------------------------------------------

    const { data: aggregatorProjects } = await client.registryProject.getMany({
        filter: {
            registry_id: destination.project.registry_id,
            type: RegistryProjectType.ECOSYSTEM_AGGREGATOR,
        },
        relations: {
            registry: true,
        },
        page: {
            limit: 1,
        },
    });

    if (aggregatorProjects.length === 0) {
        // todo: other ecosystem must have aggregator project to move to...
        return;
    }

    const aggregatorProject = aggregatorProjects[0];
    const externalImageURL = buildRemoteDockerImageURL({
        projectName: aggregatorProject.external_name,
        repositoryName: destination.repositoryName,
        hostname: aggregatorProject.registry.address,
    });

    // ------------------------------------------------------------------

    const selfRegistry = await client.registry.getOne(source.project.registry_id, {
        fields: ['+account_secret'],
    });

    const selfImageURL = buildRemoteDockerImageURL({
        hostname: selfRegistry.address,
        projectName: source.project.external_name,
        repositoryName: source.repositoryName,
        tagOrDigest: sourceArtifactTag,
    });

    await pullDockerImage(
        selfImageURL,
        buildDockerAuthConfig({
            host: selfRegistry.address,
            user: selfRegistry.account_name || source.project.account_name,
            password: selfRegistry.account_secret || source.project.account_secret,
        }),
    );

    // ------------------------------------------------------------------

    const image = await useDocker().getImage(selfImageURL);
    await image.tag({
        repo: externalImageURL,
        tag: 'latest',
    });
    await image.remove({
        force: true,
    });

    const destinationImage = await useDocker()
        .getImage(`${externalImageURL}:latest`);

    await pushDockerImage(destinationImage, buildDockerAuthConfig({
        host: aggregatorProject.registry.address,
        user: aggregatorProject.registry.account_name || aggregatorProject.account_name,
        password: aggregatorProject.registry.account_secret || aggregatorProject.account_secret,
    }));
}
