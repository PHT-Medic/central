import { Message } from 'amqp-extension';
import { URL } from 'url';
import { TrainExtractorQueuePayload } from '@personalhealthtrain/central-common';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import { parseHarborConnectionString } from '../../domains/service/harbor';
import env from '../../env';
import { DockerPullOptions, pullDockerRegistryImage } from '../../modules/docker';

const harborConfig = parseHarborConnectionString(env.harborConnectionString);
const harborUrL = new URL(harborConfig.host);

const dockerOptions : DockerPullOptions = {
    authconfig: {
        username: harborConfig.user,
        password: harborConfig.password,
        serveraddress: harborUrL.hostname,
    },
};

export async function downloadImage(message: Message) {
    const data : TrainExtractorQueuePayload = message.data as TrainExtractorQueuePayload;
    const repositoryTag = getHarborFQRepositoryPath(data.projectName, data.repositoryName);

    await pullDockerRegistryImage(repositoryTag, dockerOptions);

    return message;
}
