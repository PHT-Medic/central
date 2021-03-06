/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';

import {
    TrainManagerQueueCommand,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
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

    const dataSource = await useDataSource();
    const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
    const registryProject = await registryProjectRepository.findOneBy({
        external_name: data.namespace,
    });

    if (!registryProject) {
        useLogger()
            .info(`registry-project ${data.namespace} is not registered...`);
        return message;
    }

    await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.ROUTE, {
        repositoryName: data.repositoryName,
        projectName: data.namespace,
        operator: data.operator,
        artifactTag: data.artifactTag,
    }));

    return message;
}
