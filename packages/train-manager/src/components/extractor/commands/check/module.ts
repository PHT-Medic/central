/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    APIClient,
} from '@personalhealthtrain/central-common';
import { RegistryProjectType } from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { generateTrainMinioBucketName } from '../../../../config';
import { buildRemoteDockerImageURL, checkIfLocalRegistryImageExists, useMinio } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { ExtractorCommand } from '../../constants';
import { ExtractorError } from '../../error';
import { writeExtractedEvent, writeNoneEvent } from '../../events';
import type { ExtractorExtractPayload } from '../../type';
import { useExtractorLogger } from '../../utils';

export async function executeExtractorCheckCommand(
    input: ExtractorExtractPayload,
) : Promise<ComponentPayloadExtended<ExtractorExtractPayload>> {
    useExtractorLogger().debug('Executing command', {
        command: ExtractorCommand.CHECK,
    });

    const data = await extendPayload(input);

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
                command: ExtractorCommand.CHECK,
                data,
            });

            return data;
        } catch (e) {
            useExtractorLogger().debug('Result does not exist yet.', {
                command: ExtractorCommand.CHECK,
            });
            // do nothing :)
        }
    }

    // 2. Check if image exists locally
    const client = useClient<APIClient>();
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
                command: ExtractorCommand.CHECK,
                data,
            });

            return data;
        }
    }

    // 3. Is unknown
    await writeNoneEvent({
        command: ExtractorCommand.CHECK,
        data,
    });

    useExtractorLogger().debug('Result execution could not be confirmed.', {
        command: ExtractorCommand.CHECK,
    });

    return data;
}
