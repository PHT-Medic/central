import {Message} from "amqp-extension";
import fs from "fs";
import {getTrainResultDirectoryPath, getTrainResultFilePath} from "../../config/paths";
import {getHarborFQRepositoryPath} from "../../config/services/harbor";
import {ResultServiceCommand, ResultServiceDataPayload} from "../../domains/service/result-service";
import {generateResultId} from "../../domains/train-result/utils";
import {removeLocalRegistryImage, saveDockerContainerPathsTo} from "../../modules/docker";
import {ensureDirectory} from "../../modules/fs";

export async function extractImage(message: Message) {
    const data : ResultServiceDataPayload = message.data as ResultServiceDataPayload;

    // Create directory or do nothing...
    const trainPath : string = getTrainResultDirectoryPath();
    await ensureDirectory(trainPath);

    const resultId : string = generateResultId();
    (message.data as ResultServiceDataPayload).id = resultId;

    // delete result file if it already exists.
    const trainResultPath : string = getTrainResultFilePath(resultId);

    try {
        await fs.promises.access(trainResultPath, fs.constants.F_OK);
        await fs.promises.unlink(trainResultPath);
    } catch (e) {
        // do nothing :)
    }

    const repositoryPath : string = getHarborFQRepositoryPath(data.trainId);

    await saveDockerContainerPathsTo(
        repositoryPath,
        ['/opt/pht_results', '/opt/train_config.json'],
        trainResultPath
    );

    // we are done here with the docker image :)
    await removeLocalRegistryImage(repositoryPath);

    return message;
}


