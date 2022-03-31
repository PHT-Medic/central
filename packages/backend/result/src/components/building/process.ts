/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    TrainContainerFileName,
    TrainContainerPath,
    TrainManagerBuildPayload, TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { buildTrainConfig } from './helpers/train-config';
import { useDocker } from '../../modules/docker';
import { buildTrainDockerFile } from './helpers/dockerfile';
import { pushDockerImage } from '../../modules/docker/image-push';
import { useLogger } from '../../modules/log';
import { createPackFromFileContent } from './helpers/file-gzip';
import { buildDockerImage } from '../../modules/docker/image-build';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../config/services/registry';
import { BuildingError } from './error';

export async function processMessage(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerBuildPayload>;

    if (!data.entity) {
        throw BuildingError.notFound();
    }

    if (!data.registry) {
        throw BuildingError.registryNotFound();
    }

    if (!data.entity.incoming_registry_project_id) {
        throw BuildingError.registryProjectNotFound();
    }

    // -----------------------------------------------------------------------------------

    const { content: dockerFile, masterImagePath } = await buildTrainDockerFile({
        entity: data.entity,
        hostname: data.registry.host,
    });

    // -----------------------------------------------------------------------------------

    useLogger().debug('Building image...', {
        component: 'building',
    });

    const client = useClient<HTTPClient>();
    const incomingProject = await client.registryProject.getOne(data.entity.incoming_registry_project_id);

    data.registryProject = incomingProject;
    data.registryProjectId = incomingProject.id;

    const imageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: incomingProject.external_name,
        repositoryName: data.entity.id,
    });

    await buildDockerImage(dockerFile, imageURL);

    // -----------------------------------------------------------------------------------

    useLogger().debug('Creating container...', {
        component: 'building',
        imageURL,
    });
    const container = await useDocker()
        .createContainer({ Image: imageURL });

    // -----------------------------------------------------------------------------------

    useLogger().debug(`Writing ${TrainContainerFileName.CONFIG} to container`, {
        component: 'building',
    });
    const trainConfig = await buildTrainConfig({
        entity: data.entity,
        masterImagePath,
    });

    await container.putArchive(
        createPackFromFileContent(JSON.stringify(trainConfig), TrainContainerFileName.CONFIG),
        {
            path: '/opt',
        },
    );

    if (data.entity.query) {
        useLogger().debug(`Writing ${TrainContainerFileName.QUERY} to container`, {
            component: 'building',
        });
        await container.putArchive(
            createPackFromFileContent(JSON.stringify(data.entity.query), TrainContainerFileName.QUERY),
            {
                path: TrainContainerPath.MAIN,
            },
        );
    }

    useLogger().debug('Writing files to container', {
        component: 'building',
    });

    const stream : NodeJS.ReadableStream = await client.trainFile.download(data.id);
    await container.putArchive(stream, {
        path: TrainContainerPath.MAIN,
    });

    useLogger().debug('Tagging container', {
        component: 'building',
    });

    await container.commit({
        repo: imageURL,
        tag: 'latest',
    });

    await container.commit({
        repo: imageURL,
        tag: 'base',
    });

    // -----------------------------------------------------------------------------------

    useLogger().debug('Push committed containers as image', {
        component: 'building',
    });

    const authConfig = buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    });

    const baseImageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: incomingProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: 'base',
    });
    await pushDockerImage(baseImageURL, authConfig);

    useLogger().debug('Pushed image', {
        component: 'building',
        image: baseImageURL,
    });

    const latestImageURL = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: incomingProject.external_name,
        repositoryName: data.entity.id,
        tagOrDigest: 'latest',
    });
    await pushDockerImage(latestImageURL, authConfig);

    useLogger().debug('Pushed image', {
        component: 'building',
        image: latestImageURL,
    });

    await container.remove({
        force: true,
    });

    return message;
}
