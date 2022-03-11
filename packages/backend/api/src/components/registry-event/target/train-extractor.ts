/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';

import {
    REGISTRY_OUTGOING_PROJECT_NAME,
    TrainContainerPath,
    TrainExtractorMode,
} from '@personalhealthtrain/central-common';
import { TrainExtractorQueueCommand, buildTrainExtractorQueueMessage } from '../../../domains/special/train-extractor';
import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../../domains/special/registry';
import { useLogger } from '../../../config/log';

export async function dispatchRegistryEventToTrainExtractor(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : RegistryEventQueuePayload = message.data as RegistryEventQueuePayload;

    // only process terminated trains and the PUSH_ARTIFACT event
    if (type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useLogger()
            .info(`skipping ${type} event distribution for train-extractor`);
        return message;
    }

    const isOutgoingProject : boolean = data.namespace === REGISTRY_OUTGOING_PROJECT_NAME;

    await publishMessage(buildTrainExtractorQueueMessage(TrainExtractorQueueCommand.START, {
        repositoryName: data.repositoryName,
        projectName: data.namespace,

        filePaths: [
            ...(isOutgoingProject ? [TrainContainerPath.RESULTS] : []),
            TrainContainerPath.CONFIG,
        ],

        mode: isOutgoingProject ?
            TrainExtractorMode.WRITE :
            TrainExtractorMode.READ,
    }));

    return message;
}
