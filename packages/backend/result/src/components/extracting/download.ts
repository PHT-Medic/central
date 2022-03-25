/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    HTTPClient,
    RegistryProjectType,
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractingStep,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../config/services/registry';
import { pullDockerImage } from '../../modules/docker';
import { ExtractingError } from './error';

export async function downloadImage(message: Message) {
    const data: TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;

    if (!data.registry) {
        throw ExtractingError.registryNotFound({
            step: TrainManagerExtractingStep.DOWNLOAD,
        });
    }

    const client = useClient<HTTPClient>();

    const { data: outgoingProjects } = await client.registryProject.getMany({
        filter: {
            registry_id: data.registry.id,
            type: RegistryProjectType.OUTGOING,
        },
    });

    for (let i = 0; i < outgoingProjects.length; i++) {
        const repositoryTag = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: outgoingProjects[i].external_name,
            repositoryName: data.id,
        });

        try {
            await pullDockerImage(repositoryTag, buildDockerAuthConfig({
                host: data.registry.host,
                user: data.registry.account_name,
                password: data.registry.account_secret,
            }));

            data.registryProject = outgoingProjects[i];
        } catch (e) {
            // ...
        }
    }

    if (!data.registryProject) {
        throw ExtractingError.registryProjectNotFound({
            step: TrainManagerExtractingStep.DOWNLOAD,
            message: 'The train was not found in any outgoing registry project.',
        });
    }

    return message;
}
