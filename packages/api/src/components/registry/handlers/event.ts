/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { TrainManagerComponent, TrainManagerRouterCommand } from '@personalhealthtrain/central-common';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../config';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import type { RegistryEventQueuePayload } from '../../../domains/special/registry';
import { RegistryQueueEvent } from '../../../domains/special/registry';
import { buildTrainManagerQueueMessage } from '../../../domains/special/train-manager';

export async function dispatchRegistryEventToTrainManager(
    event: string,
    data: RegistryEventQueuePayload,
) {
    // only process terminated trains and the PUSH_ARTIFACT event
    if (event !== RegistryQueueEvent.PUSH_ARTIFACT) {
        useLogger()
            .info(`skipping ${event} event distribution for train-manager`);
        return;
    }

    const dataSource = await useDataSource();
    const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
    const registryProject = await registryProjectRepository.findOneBy({
        external_name: data.namespace,
    });

    if (!registryProject) {
        useLogger()
            .info(`registry-project ${data.namespace} is not registered...`);
        return;
    }

    await publish(buildTrainManagerQueueMessage(
        TrainManagerComponent.ROUTER,
        TrainManagerRouterCommand.ROUTE,
        {
            repositoryName: data.repositoryName,
            projectName: data.namespace,
            operator: data.operator,
            artifactTag: data.artifactTag,
        },
    ));
}
