/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient,
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_LATEST,
    TrainContainerFileName,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import {
    buildDockerAuthConfig,
    buildRemoteDockerImageURL,
    useDocker,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { BuilderCommand } from '../../constants';
import { buildTrainDockerFile, packContainerWithTrain } from '../../helpers';
import { buildDockerImage } from '../../../../core/docker/image-build';
import { BuilderError } from '../../error';
import type { BuilderBuildPayload } from '../../type';
import { useBuilderLogger } from '../../utils';

export async function processBuildCommand(
    input: BuilderBuildPayload,
) : Promise<ComponentPayloadExtended<BuilderBuildPayload>> {
    const data = await extendPayload(input);

    if (!data.entity) {
        throw BuilderError.notFound();
    }

    if (!data.registry) {
        throw BuilderError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        throw BuilderError.registryProjectNotFound();
    }

    // -----------------------------------------------------------------------------------

    const { content: dockerFile, masterImagePath } = await buildTrainDockerFile({
        entity: data.entity,
        hostname: data.registry.host,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Building image...', {
        command: BuilderCommand.BUILD,
    });

    const client = useClient<HTTPClient>();
    const incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);

    data.registryProject = incomingProject;

    const imageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: incomingProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
    });

    const authConfig = buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    });

    await buildDockerImage({
        content: dockerFile,
        imageName: imageURL,
        authConfig,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Creating container...', {
        command: BuilderCommand.BUILD,
        imageURL,
    });

    const container = await useDocker()
        .createContainer({ Image: imageURL });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug(`Building ${TrainContainerFileName.CONFIG}`, {
        command: BuilderCommand.BUILD,
    });

    await packContainerWithTrain(container, {
        train: data.entity,
        masterImagePath,
    });

    // -----------------------------------------------------------------------------------

    useBuilderLogger().debug('Tagging container', {
        command: BuilderCommand.BUILD,
    });

    await container.commit({
        repo: imageURL,
        tag: 'latest',
    });

    await container.commit({
        repo: imageURL,
        tag: 'base',
    });

    await container.remove({
        force: true,
    });

    return data;
}
