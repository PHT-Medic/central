/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerExtractingQueuePayload,
    TrainManagerRoutingQueueEvent,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';

export async function handleTrainManagerRoutingQueueEvent(
    data: TrainManagerExtractingQueuePayload,
    event: TrainManagerRoutingQueueEvent,
) {
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

    let status : TrainRunStatus = null;

    switch (event) {
        case TrainManagerRoutingQueueEvent.STARTED:
            status = TrainRunStatus.STARTED;
            break;
        case TrainManagerRoutingQueueEvent.MOVED:
            console.log(data);
            // todo: don't do anything here yet ;)
            break;
        case TrainManagerRoutingQueueEvent.FAILED:
            status = TrainRunStatus.FAILED;
            break;
        case TrainManagerRoutingQueueEvent.FINISHED:
            status = TrainRunStatus.FINISHED;
            break;
    }

    entity.run_status = status;

    await repository.save(entity);
}
