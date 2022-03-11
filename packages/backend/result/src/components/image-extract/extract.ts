import { Message } from 'amqp-extension';
import fs from 'fs';
import { TrainExtractorMode, TrainExtractorQueuePayload } from '@personalhealthtrain/central-common';
import { buildImageOutputFilePath, getImageOutputDirectoryPath } from '../../config/paths';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import { readDockerContainerPaths, removeLocalRegistryImage, saveDockerContainerPathsTo } from '../../modules/docker';
import { ensureDirectory } from '../../modules/fs';

export async function extractImage(message: Message) {
    const data : TrainExtractorQueuePayload = message.data as TrainExtractorQueuePayload;

    if (!data.filePaths || data.filePaths.length === 0) {
        return {
            ...message,
            data,
        };
    }

    const repositoryPath : string = getHarborFQRepositoryPath(data.projectName, data.repositoryName);

    switch (data.mode) {
        case TrainExtractorMode.READ: {
            data.files = await readDockerContainerPaths(
                repositoryPath,
                data.filePaths,
            );

            break;
        }
        case TrainExtractorMode.WRITE: {
            // Create directory or do nothing...
            const destinationPath : string = getImageOutputDirectoryPath();
            await ensureDirectory(destinationPath);

            // delete result file if it already exists.
            const outputFilePath : string = buildImageOutputFilePath(data.repositoryName);

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
}
