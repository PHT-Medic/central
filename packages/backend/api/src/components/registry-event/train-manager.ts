/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';

import {
    RegistryProjectType,
    TrainContainerPath,
    TrainManagerExtractingMode,
    TrainManagerQueueCommand,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { buildTrainManagerQueueMessage } from '../../domains/special/train-manager';
import { RegistryEventQueuePayload, RegistryQueueEvent } from '../../domains/special/registry';
import { useLogger } from '../../config/log';
import { RegistryProjectEntity } from '../../domains/core/registry-project/entity';

export async function dispatchRegistryEventToTrainManager(
    message: Message,
) : Promise<Message> {
    const type : RegistryQueueEvent = message.type as RegistryQueueEvent;
    const data : RegistryEventQueuePayload = message.data as RegistryEventQueuePayload;

    // only process terminated trains and the PUSH_ARTIFACT event
    if (type !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useLogger()
            .info(`skipping ${type} event distribution for train-manager`);
        return message;
    }

    const registryProjectRepository = getRepository(RegistryProjectEntity);
    const registryProject = await registryProjectRepository.findOne({
        external_name: data.namespace,
    });

    if (typeof registryProject === 'undefined') {
        useLogger()
            .info(`registry-project ${data.namespace} is not registered...`);
        return message;
    }

    if (registryProject.type === RegistryProjectType.OUTGOING) {
        await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT, {
            id: data.repositoryName,

            filePaths: [
                TrainContainerPath.RESULTS,
                TrainContainerPath.CONFIG,
            ],

            mode: TrainManagerExtractingMode.WRITE,
        }));

        return message;
    }

    if (
        registryProject.type === RegistryProjectType.STATION ||
        registryProject.type === RegistryProjectType.INCOMING ||
        registryProject.type === RegistryProjectType.ECOSYSTEM_AGGREGATOR
    ) {
        await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.ROUTE, {
            repositoryName: data.repositoryName,
            projectName: data.namespace,
            operator: data.operator,
            artifactTag: data.artifactTag,
        }));
    }

    return message;
}
