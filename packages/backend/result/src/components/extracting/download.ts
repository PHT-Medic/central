/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractionStep,
} from '@personalhealthtrain/central-common';
import { buildDockerAuthConfig, buildRemoteDockerImageURL } from '../../config/services/registry';
import { pullDockerImage } from '../../modules/docker';
import { ExtractingError } from './error';

export async function downloadImage(message: Message) {
    try {
        const data: TrainManagerExtractingQueuePayload = message.data as TrainManagerExtractingQueuePayload;
        const repositoryTag = buildRemoteDockerImageURL({
            projectName: data.projectName,
            repositoryName: data.repositoryName,
        });

        await pullDockerImage(repositoryTag, buildDockerAuthConfig());

        return message;
    } catch (e) {
        throw new ExtractingError(TrainManagerExtractionStep.DOWNLOAD, e.message);
    }
}
