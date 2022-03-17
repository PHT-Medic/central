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
    TrainManagerExtractionMode, TrainManagerQueueCommand,
} from '@personalhealthtrain/central-common';
import { buildTrainManagerQueueMessage } from '../../../domains/special/train-manager';
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

    await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT, {
        repositoryName: data.repositoryName,
        projectName: data.namespace,

        filePaths: [
            ...(isOutgoingProject ? [TrainContainerPath.RESULTS] : []),
            TrainContainerPath.CONFIG,
        ],

        mode: isOutgoingProject ?
            TrainManagerExtractionMode.WRITE :
            TrainManagerExtractionMode.READ,
    }));

    return message;
}
