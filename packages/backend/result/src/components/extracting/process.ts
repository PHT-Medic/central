import { Message } from 'amqp-extension';
import fs from 'fs';
import { TrainManagerExtractingQueuePayload, TrainManagerExtractionMode, TrainManagerExtractionStep } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath, getImageOutputDirectoryPath } from '../../config/paths';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import { readDockerContainerPaths, removeLocalRegistryImage, saveDockerContainerPathsTo } from '../../modules/docker';
import { ensureDirectory } from '../../modules/fs';
import { ExtractingError } from './error';

export async function processEvent(message: Message) {
    try {
        const data: TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;

        if (!data.filePaths || data.filePaths.length === 0) {
            return {
                ...message,
                data,
            };
        }

        const repositoryPath: string = getHarborFQRepositoryPath(data.projectName, data.repositoryName);

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
            await removeLocalRegistryImage(repositoryPath);
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
