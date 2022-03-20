/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    REGISTRY_INCOMING_PROJECT_NAME,
    TrainContainerFileName,
    TrainContainerPath, TrainManagerBuildPayload,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { NotFoundError } from '@typescript-error/http';
import { buildTrainConfig } from './helpers/train-config';
import { useDocker } from '../../modules/docker';
import { buildDockerFile } from './helpers/dockerfile';
import { pushDockerImages } from '../../modules/docker/image-push';
import { useLogger } from '../../modules/log';
import { createPackFromFileContent } from './helpers/file-gzip';
import { buildDockerImage } from '../../modules/docker/image-build';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../config/services/registry';

export async function processMessage(message: Message) {
    const data = message.data as TrainManagerBuildPayload;

    const client = useClient<HTTPClient>();

    const train = await client.train.getOne(data.id, {
        relations: {
            entrypoint_file: true,
            master_image: true,
        },
    });

    if (typeof train === 'undefined') {
        throw new NotFoundError();
    }

    // -----------------------------------------------------------------------------------

    useLogger().debug('Creating Dockerfile...', {
        component: 'building',
    });
    const dockerFile = await buildDockerFile(train);

    // -----------------------------------------------------------------------------------

    useLogger().debug('Building image...', {
        component: 'building',
    });

    const imageURL = buildRemoteDockerImageURL(REGISTRY_INCOMING_PROJECT_NAME, train.id);
    await buildDockerImage(dockerFile, imageURL);

    // -----------------------------------------------------------------------------------

    useLogger().debug('Creating container...', {
        component: 'building',
    });
    const container = await useDocker()
        .createContainer({ Image: imageURL });

    // -----------------------------------------------------------------------------------

    useLogger().debug(`Writing ${TrainContainerFileName.CONFIG} to container`, {
        component: 'building',
    });
    const trainConfig = await buildTrainConfig(train);
    await container.putArchive(
        createPackFromFileContent(JSON.stringify(trainConfig), TrainContainerFileName.CONFIG),
        {
            path: '/opt',
        },
    );

    if (train.query) {
        useLogger().debug(`Writing ${TrainContainerFileName.QUERY} to container`, {
            component: 'building',
        });
        await container.putArchive(
            createPackFromFileContent(JSON.stringify(train.query), TrainContainerFileName.QUERY),
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

    const authConfig = buildDockerAuthConfig();

    const baseImageURL = buildRemoteDockerImageURL(REGISTRY_INCOMING_PROJECT_NAME, data.id, 'base');
    await pushDockerImages(baseImageURL, authConfig);

    const latestImageURL = buildRemoteDockerImageURL(REGISTRY_INCOMING_PROJECT_NAME, data.id, 'latest');
    await pushDockerImages(latestImageURL, authConfig);

    useLogger().debug('Pushed image', {
        component: 'building',
        urls: [
            latestImageURL,
            baseImageURL,
        ],
    });

    await container.remove({
        force: true,
    });

    return message;
}
