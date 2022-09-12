/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import fs from 'fs';
import {
    HTTPClient,
    RegistryProjectType,
    TrainManagerExtractorExtractQueuePayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { buildImageOutputFilePath } from '../../../../config/paths';
import { buildRemoteDockerImageURL } from '../../../../config/services/registry';
import { checkIfLocalRegistryImageExists } from '../../../../modules/docker';
import { ExtractorError } from '../../error';
import { writeExtractedEvent } from '../extract';
import { writeNoneEvent } from './write-none';

export async function processCheckCommand(message: Message) : Promise<Message> {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerExtractorExtractQueuePayload>;

    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    // 1. Check if result already exists.
    const trainResultPath : string = buildImageOutputFilePath(data.id);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);

        await writeExtractedEvent(message);

        return message;
    } catch (e) {
        // do nothing :)
    }

    // 2. Check if image exists locally
    const client = useClient<HTTPClient>();

    const { data: incomingProjects } = await client.registryProject.getMany({
        filter: {
            registry_id: data.registry.id,
            type: RegistryProjectType.INCOMING,
        },
    });

    for (let i = 0; i < incomingProjects.length; i++) {
        const repositoryTag = buildRemoteDockerImageURL({
            hostname: data.registry.host,
            projectName: incomingProjects[i].external_name,
            repositoryName: data.id,
        });

        const exists : boolean = await checkIfLocalRegistryImageExists(repositoryTag);

        if (exists) {
            await writeExtractedEvent(message);

            return message;
        }
    }

    // 3. Is unknown
    await writeNoneEvent(message);

    return message;
}
