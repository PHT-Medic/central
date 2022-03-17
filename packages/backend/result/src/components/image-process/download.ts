/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { URL } from 'url';
import {
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractionStep,
    parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import { getHarborFQRepositoryPath } from '../../config/services/harbor';
import env from '../../env';
import { DockerPullOptions, pullDockerRegistryImage } from '../../modules/docker';
import { ImageProcessError } from './error';

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
    try {
        const data: TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;
        const repositoryTag = getHarborFQRepositoryPath(data.projectName, data.repositoryName);

        await pullDockerRegistryImage(repositoryTag, dockerOptions);

        return message;
    } catch (e) {
        throw new ImageProcessError(TrainManagerExtractionStep.DOWNLOAD, e.message);
    }
}
