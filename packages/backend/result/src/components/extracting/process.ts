/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import fs from 'fs';
import { TrainManagerExtractingQueuePayload, TrainManagerExtractionMode, TrainManagerExtractionStep } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath, getImageOutputDirectoryPath } from '../../config/paths';
import { buildRemoteDockerImageURL } from '../../config/services/registry';
import { readDockerContainerPaths, removeDockerImage, saveDockerContainerPathsTo } from '../../modules/docker';
import { ensureDirectory } from '../../modules/fs';
import { ExtractingError } from './error';

export async function processExtractCommand(message: Message) {
    try {
        const data: TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;

        if (!data.filePaths || data.filePaths.length === 0) {
            return {
                ...message,
                data,
            };
        }

        const repositoryPath: string = buildRemoteDockerImageURL(data.projectName, data.repositoryName);

        switch (data.mode) {
            case TrainManagerExtractionMode.READ: {
                data.files = await readDockerContainerPaths(
                    repositoryPath,
                    data.filePaths,
                );

                break;
            }
            case TrainManagerExtractionMode.WRITE: {
                // Create directory or do nothing...
                const destinationPath: string = getImageOutputDirectoryPath();
                await ensureDirectory(destinationPath);

                // delete result file if it already exists.
                const outputFilePath: string = buildImageOutputFilePath(data.repositoryName);

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

                break;
            }
        }

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
    } catch (e) {
        throw new ExtractingError(TrainManagerExtractionStep.EXTRACT, e.message);
    }
}
