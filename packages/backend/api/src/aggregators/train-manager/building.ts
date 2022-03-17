/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainBuildStatus,
    TrainManagerBuildingQueueEvent,
    TrainManagerExtractingQueuePayload,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';

export async function handleTrainManagerBuildingQueueEvent(
    data: TrainManagerExtractingQueuePayload,
    event: TrainManagerBuildingQueueEvent,
) {
    useLogger()
        .info(`Received train-manager building ${event} event.`, {
            aggregator: 'train-manager',
            payload: data,
        });

    const repository = getRepository(TrainEntity);

    const entity = await repository.findOne(data.repositoryName);
    if (typeof entity === 'undefined') {
        return;
    }

    let status : TrainBuildStatus = null;

    switch (event) {
        case TrainManagerBuildingQueueEvent.STARTED:
            status = TrainBuildStatus.STARTED;
            break;
        case TrainManagerBuildingQueueEvent.FAILED:
            status = TrainBuildStatus.FAILED;
            break;
        case TrainManagerBuildingQueueEvent.FINISHED:
            status = TrainBuildStatus.FINISHED;
            break;
    }

    entity.build_status = status;

    await repository.save(entity);
}
