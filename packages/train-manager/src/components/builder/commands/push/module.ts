/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainManagerBuilderBuildPayload, TrainManagerQueuePayloadExtended } from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_BASE, REGISTRY_ARTIFACT_TAG_LATEST, TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import {
    buildDockerAuthConfig, buildRemoteDockerImageURL, pushDockerImage, useLogger,
} from '../../../../core';
import { BuilderError } from '../../error';

export async function processPushCommand(
    data: TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>,
) : Promise<TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>> {
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

    useLogger().debug('Push committed containers as image', {
        component: TrainManagerComponent.BUILDER,
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

    useLogger().debug('Pushed image', {
        component: TrainManagerComponent.BUILDER,
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

    useLogger().debug('Pushed image', {
        component: TrainManagerComponent.BUILDER,
        image: latestImageURL,
    });

    // -----------------------------------------------------------------------------------

    return data;
}
