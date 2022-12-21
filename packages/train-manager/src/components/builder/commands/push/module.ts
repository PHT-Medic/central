/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    REGISTRY_ARTIFACT_TAG_BASE, REGISTRY_ARTIFACT_TAG_LATEST,
    TrainManagerBuilderBuildPayload, TrainManagerComponent, TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { pushDockerImage } from '../../../../modules/docker/image-push';
import { useLogger } from '../../../../modules/log';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../../../config/services/registry';
import { BuilderError } from '../../error';

export async function processPushCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBuilderBuildPayload>;

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

    return message;
}
