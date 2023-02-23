/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient,
    TrainManagerExtractorExtractQueuePayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { RegistryProjectType, TrainManagerExtractorCommand } from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { generateTrainMinioBucketName } from '../../../../config';
import { buildRemoteDockerImageURL, checkIfLocalRegistryImageExists, useMinio } from '../../../../core';
import { ExtractorError } from '../../error';
import { writeExtractedEvent, writeNoneEvent } from '../../events';

export async function processCheckCommand(
    data: TrainManagerQueuePayloadExtended<TrainManagerExtractorExtractQueuePayload>,
) : Promise<TrainManagerQueuePayloadExtended<TrainManagerExtractorExtractQueuePayload>> {
    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    // 1. Check if result already exists.
    const minio = useMinio();
    const bucketName = generateTrainMinioBucketName(data.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        try {
            await minio.getObject(bucketName, 'result');

            await writeExtractedEvent({
                command: TrainManagerExtractorCommand.CHECK,
                data,
            });

            return data;
        } catch (e) {
            // do nothing :)
        }
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
            await writeExtractedEvent({
                command: TrainManagerExtractorCommand.CHECK,
                data,
            });

            return data;
        }
    }

    // 3. Is unknown
    await writeNoneEvent({
        command: TrainManagerExtractorCommand.CHECK,
        data,
    });

    return data;
}
