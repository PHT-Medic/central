/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractingStep, TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../config/services/registry';
import { pullDockerImage } from '../../modules/docker';
import { ExtractingError } from './error';

export async function downloadImage(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerExtractingQueuePayload>;

    if (!data.registry) {
        throw ExtractingError.registryNotFound({
            step: TrainManagerExtractingStep.DOWNLOAD,
        });
    }

    const client = useClient<HTTPClient>();

    const registryProject = await client.registryProject.getOne(data.entity.outgoing_registry_project_id);
    data.registryProject = registryProject;
    data.registryProjectId = registryProject.id;

    const repositoryTag = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: registryProject.external_name,
        repositoryName: data.id,
    });

    await pullDockerImage(repositoryTag, buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    }));

    return {
        ...message,
        data,
    };
}
