/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    HTTPClient, REGISTRY_ARTIFACT_TAG_BASE,
    Registry,
    RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { TransferEcosystemItem, TransferItem } from './type';
import { pullDockerImage, useDocker } from '../../../../../modules/docker';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../../../../config/services/registry';
import { pushDockerImage } from '../../../../../modules/docker/image-push';
import { useLogger } from '../../../../../modules/log';
import { RouterError } from '../../../error';

export async function transferEcosystemOut(
    source: TransferItem,
    destination: TransferEcosystemItem,
) {
    const sourceArtifactTag = source.artifactTag || 'latest';

    if (
        sourceArtifactTag === REGISTRY_ARTIFACT_TAG_BASE ||
        destination.ecosystem === Ecosystem.DEFAULT
    ) {
        // don't move base tag to external ... ^^
        return;
    }

    useLogger().debug(`Move repository ${source.repositoryName} from ${source.project.name} project to ${destination.ecosystem} ecosystem.`, {
        component: 'routing',
    });

    const client = await useClient<HTTPClient>();

    // ------------------------------------------------------------------

    const { data: externalProjects } = await client.registryProject.getMany({
        filter: {
            ecosystem: destination.ecosystem,
            type: RegistryProjectType.AGGREGATOR,
        },
        page: {
            limit: 1,
        },
    });

    if (externalProjects.length === 0) {
        throw RouterError.registryProjectNotFound({
            message: `No aggregator project for the external ecosystem ${destination.ecosystem} was found`,
        });
    }

    const aggregatorProject = externalProjects[0];

    // ------------------------------------------------------------------

    let aggregatorRegistry : Registry;

    try {
        aggregatorRegistry = await client.registry.getOne(aggregatorProject.registry_id, {
            fields: ['+account_secret'],
        });
    } catch (e) {
        throw RouterError.registryNotFound({
            message: `No aggregator registry for the external ecosystem ${destination.ecosystem} was found`,
        });
    }

    // ------------------------------------------------------------------

    const externalImageURL = buildRemoteDockerImageURL({
        projectName: aggregatorProject.external_name,
        repositoryName: destination.repositoryName,
        hostname: aggregatorRegistry.host,
    });

    // ------------------------------------------------------------------

    const selfRegistry = await client.registry.getOne(source.project.registry_id, {
        fields: ['+account_secret'],
    });

    const selfImageURL = buildRemoteDockerImageURL({
        hostname: selfRegistry.host,
        projectName: source.project.external_name,
        repositoryName: source.repositoryName,
        tagOrDigest: sourceArtifactTag,
    });

    await pullDockerImage(
        selfImageURL,
        buildDockerAuthConfig({
            host: selfRegistry.host,
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
        host: aggregatorRegistry.host,
        user: aggregatorRegistry.account_name,
        password: aggregatorRegistry.account_secret,
    }));
}
