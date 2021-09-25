import {Message} from "amqp-extension";
import fs from "fs";
import {getTrainResultDirectoryPath, getTrainResultFilePath} from "../../config/paths";
import {getFullHarborRepositoryNamePath} from "../../config/services/harbor";
import {removeLocalRegistryImage, saveDockerContainerPathsTo} from "../../modules/docker";
import {ensureDirectory} from "../../modules/fs";

export async function extractImage(message: Message) {
    // Create directory or do nothing...
    const trainPath : string = getTrainResultDirectoryPath();
    await ensureDirectory(trainPath);

    // delete result file if it already exists.
    const trainResultPath : string = getTrainResultFilePath(message.data.resultId);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);
        await fs.promises.unlink(trainResultPath);
    } catch (e) {
        // do nothing :)
    }

    await saveDockerContainerPathsTo(
        getFullHarborRepositoryNamePath(message.data.repositoryFullName),
        ['/opt/pht_results', '/opt/train_config.json'],
        trainResultPath
    );

    // we are done here with the docker image :)
    const repositoryPath : string = getFullHarborRepositoryNamePath(message.data.repositoryFullName);
    await removeLocalRegistryImage(repositoryPath);

    return message;
}


