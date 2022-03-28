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

    const entity = await repository.findOne(data.id);
    if (typeof entity === 'undefined') {
        return;
    }

    switch (event) {
        case TrainManagerBuildingQueueEvent.NONE:
            entity.build_status = null;
            break;
        case TrainManagerBuildingQueueEvent.STARTED:
            entity.build_status = TrainBuildStatus.STARTED;
            break;
        case TrainManagerBuildingQueueEvent.FAILED:
            entity.build_status = TrainBuildStatus.FAILED;
            break;
        case TrainManagerBuildingQueueEvent.FINISHED:
            entity.build_status = TrainBuildStatus.FINISHED;
            break;
    }

    if (
        event === TrainManagerBuildingQueueEvent.STARTED ||
        event === TrainManagerBuildingQueueEvent.FAILED ||
        event === TrainManagerBuildingQueueEvent.NONE
    ) {
        entity.run_status = null;
        entity.run_station_index = null;
        entity.run_status = null;
        entity.result_status = null;
    }

    await repository.save(entity);
}
