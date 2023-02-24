/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE, REGISTRY_ARTIFACT_TAG_LATEST,
} from '@personalhealthtrain/central-common';
import {
    buildDockerAuthConfig, buildRemoteDockerImageURL, pushDockerImage,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderCommand } from '../../constants';
import { BuilderError } from '../../error';
import type { BuilderBuildPayload } from '../../type';
import { useBuilderLogger } from '../../utils';

export async function processPushCommand(
    input: BuilderBuildPayload,
) : Promise<ComponentPayloadExtended<BuilderBuildPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.registryProject) {
        throw BuilderError.registryProjectNotFound();
    }

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Push committed containers as image', {
        command: BuilderCommand.BUILD,
    });

    const authConfig = buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    });

    // -----------------------------------------------------------------------------------

    const baseImageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: data.registryProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: REGISTRY_ARTIFACT_TAG_BASE,
    });

    await pushDockerImage(baseImageURL, authConfig);

    useBuilderLogger().debug('Pushed image', {
        command: BuilderCommand.BUILD,
        image: baseImageURL,
    });

    // -----------------------------------------------------------------------------------

    const latestImageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: data.registryProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
    });

    await pushDockerImage(latestImageURL, authConfig);

    useBuilderLogger().debug('Pushed image', {
        command: BuilderCommand.BUILD,
        image: latestImageURL,
    });

    // -----------------------------------------------------------------------------------

    return data;
}
