/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    TrainManagerRoutingPayload, TrainManagerRoutingQueueEvent, TrainRunStatus, isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';

export async function handleTrainManagerRoutingQueueEvent(
    data: TrainManagerRoutingPayload,
    event: TrainManagerRoutingQueueEvent,
) {
    if (data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    useLogger()
        .info(`Received train-manager routing ${event} event.`, {
            aggregator: 'train-manager',
            payload: data,
        });

    const repository = getRepository(TrainEntity);

    const entity = await repository.findOne(data.repositoryName);
    if (typeof entity === 'undefined') {
        return;
    }

    switch (event) {
        case TrainManagerRoutingQueueEvent.STARTED:
            entity.run_status = TrainRunStatus.STARTED;
            break;
        case TrainManagerRoutingQueueEvent.MOVE_FINISHED:
            if (
                isRegistryStationProjectName(data.projectName) ||
                data.projectName === REGISTRY_INCOMING_PROJECT_NAME
            ) {
                entity.run_status = TrainRunStatus.RUNNING;
            }

            if (data.projectName === REGISTRY_OUTGOING_PROJECT_NAME) {
                entity.run_status = TrainRunStatus.FINISHED;
            }
            break;
        case TrainManagerRoutingQueueEvent.FAILED:
            entity.run_status = TrainRunStatus.FAILED;
            entity.result_status = null;
            break;
        case TrainManagerRoutingQueueEvent.FINISHED:
            entity.run_status = TrainRunStatus.FINISHED;
            break;
    }

    await repository.save(entity);
}
