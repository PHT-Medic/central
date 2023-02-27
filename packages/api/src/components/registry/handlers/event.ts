/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { RouterCommand, buildRouterQueuePayload } from '@personalhealthtrain/train-manager';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../config';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import { RegistryHookEvent } from '../constants';
import type { RegistryEventPayload } from '../type';

export async function dispatchRegistryEventToTrainManager(
    data: RegistryEventPayload,
) {
    // only process terminated trains and the PUSH_ARTIFACT event
    switch (data.event) {
        case RegistryHookEvent.PUSH_ARTIFACT: {
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

            await publish(buildRouterQueuePayload({
                command: RouterCommand.ROUTE,
                data: {
                    repositoryName: data.repositoryName,
                    projectName: data.namespace,
                    operator: data.operator,
                    artifactTag: data.artifactTag,
                },
            }));
            break;
        }
        case RegistryHookEvent.DELETE_ARTIFACT:
        case RegistryHookEvent.PULL_ARTIFACT:
        case RegistryHookEvent.QUOTA_EXCEED:
        case RegistryHookEvent.QUOTA_WARNING:
        case RegistryHookEvent.SCANNING_COMPLETED:
        case RegistryHookEvent.SCANNING_FAILED: {
            useLogger()
                .info(`skipping registry event: ${data.event}`);
            break;
        }
    }
}
