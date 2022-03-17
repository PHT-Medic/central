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
    TrainBuilderStartPayload,
    TrainContainerFileName,
    TrainContainerPath, parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { URL } from 'url';
import { buildTrainConfig } from './helpers/train-config';
import { useDocker } from '../../modules/docker';
import { buildDockerFile } from './helpers/dockerfile';
import env from '../../env';
import { pushDockerImages } from '../../modules/docker/image-push';
import { useLogger } from '../../modules/log';
import { createPackFromFileContent } from './helpers/file-gzip';
import { buildDockerImage } from '../../modules/docker/image-build';

export async function processMessage(message: Message) {
    const data = message.data as TrainBuilderStartPayload;

    const harborConfig = parseHarborConnectionString(env.harborConnectionString);
    const harborUrL = new URL(harborConfig.host);

    const repository = `${harborUrL.hostname}/${REGISTRY_INCOMING_PROJECT_NAME}/${data.id}`;

    const dockerFile = await buildDockerFile(data);
    await buildDockerImage(dockerFile, repository);

    useLogger().debug('Creating container...', {
        component: 'building',
    });
    const container = await useDocker()
        .createContainer({ Image: repository });

    useLogger().debug(`Writing ${TrainContainerFileName.CONFIG} to container`, {
        component: 'building',
    });
    const trainConfig = await buildTrainConfig(data);
    await container.putArchive(
        createPackFromFileContent(JSON.stringify(trainConfig), TrainContainerFileName.CONFIG),
        {
            path: '/opt',
        },
    );

    if (data.query) {
        useLogger().debug(`Writing ${TrainContainerFileName.QUERY} to container`, {
            component: 'building',
        });
        await container.putArchive(
            createPackFromFileContent(JSON.stringify(data.query), TrainContainerFileName.QUERY),
            {
                path: TrainContainerPath.MAIN,
            },
        );
    }

    useLogger().debug('Writing files to container', {
        component: 'building',
    });
    const client = useClient<HTTPClient>();
    const stream : NodeJS.ReadableStream = await client.trainFile.download(data.id);
    await container.putArchive(stream, {
        path: TrainContainerPath.MAIN,
    });

    useLogger().debug('Tagging container', {
        component: 'building',
    });

    await container.commit({
        repo: repository,
        tag: 'latest',
    });

    await container.commit({
        repo: repository,
        tag: 'base',
    });

    useLogger().debug('Push committed containers as image', {
        component: 'building',
    });

    await pushDockerImages([
        { name: repository, tag: 'base' },
        { name: repository, tag: 'latest' },
    ], {
        remove: true,
    });

    useLogger().debug('Pushed image', {
        component: 'building',
        repository: [
            `${repository}:latest`,
            `${repository}:base`,
        ],
    });

    await container.remove({
        force: true,
    });

    return message;
}
