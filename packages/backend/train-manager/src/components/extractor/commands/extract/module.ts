/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import fs from 'fs';
import {
    TrainManagerExtractorExtractQueuePayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath, getImageOutputDirectoryPath } from '../../../../config/paths';
import { buildRemoteDockerImageURL } from '../../../../config/services/registry';
import { removeDockerImage, saveDockerContainerPathsTo } from '../../../../modules/docker';
import { ensureDirectory } from '../../../../modules/fs';
import { ExtractorError } from '../../error';

export async function processExtractCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerExtractorExtractQueuePayload>;

    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    if (!data.registryProject) {
        throw ExtractorError.registryProjectNotFound({
            message: 'There was no registry-project during the download process.',
        });
    }

    if (!data.filePaths || data.filePaths.length === 0) {
        return {
            ...message,
            data,
        };
    }

    // -----------------------------------------------------------------------------------

    const repositoryPath: string = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: data.registryProject.external_name,
        repositoryName: data.id,
    });

    // Create directory or do nothing...
    const destinationPath: string = getImageOutputDirectoryPath();
    await ensureDirectory(destinationPath);

    // delete result file if it already exists.
    const outputFilePath: string = buildImageOutputFilePath(data.id);

    try {
        await fs.promises.access(outputFilePath, fs.constants.F_OK);
        await fs.promises.unlink(outputFilePath);
    } catch (e) {
        // do nothing :)
    }

    await saveDockerContainerPathsTo(
        repositoryPath,
        data.filePaths,
        outputFilePath,
    );

    try {
        // we are done here with the docker image :)
        await removeDockerImage(repositoryPath);
    } catch (e) {
        // we tried :P
    }

    return {
        ...message,
        data,
    };
}
