/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainBuildStatus,
    TrainRunStatus,
    TrainStationRunStatus,
} from '@personalhealthtrain/ui-common';
import { ConsumeHandlers, Message } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { TrainEntity } from '../../../domains/core/train/entity';
import { TrainStationEntity } from '../../../domains/core/train-station/entity';

export enum AggregatorTrainEvent {
    BUILD_FINISHED = 'trainBuilt',
    STARTED = 'trainStarted',
    MOVED = 'trainMoved',
    FINISHED = 'trainFinished',
}

async function handle(message: Message) {
    const repository = getRepository(TrainEntity);
    const entity = await repository.findOne(message.data.id);

    switch (message.type) {
        case AggregatorTrainEvent.BUILD_FINISHED:
            entity.build_status = TrainBuildStatus.FINISHED;
            break;
        case AggregatorTrainEvent.STARTED:
            entity.run_status = TrainRunStatus.RUNNING;
            entity.run_station_id = null;
            entity.run_station_index = null;
            break;
        case AggregatorTrainEvent.MOVED:
            entity.run_status = TrainRunStatus.RUNNING;
            entity.run_station_id = message.data.stationId;
            entity.run_station_index = message.data.stationIndex;
            break;
        case AggregatorTrainEvent.FINISHED:
            entity.run_status = TrainRunStatus.FINISHED;
            entity.run_station_id = null;
            entity.run_station_index = null;
            break;
    }

    await repository.save(entity);

    if (message.type === AggregatorTrainEvent.MOVED) {
        const trainStationRepository = getRepository(TrainStationEntity);
        const trainStation = await trainStationRepository.findOne({
            train_id: message.data.id,
            station_id: message.data.stationId,
        });

        if (typeof trainStation !== 'undefined') {
            trainStation.run_status = message.data.status as TrainStationRunStatus;
            await trainStationRepository.save(trainStation);
        }
    }
}

export function createDispatcherAggregatorTrainHandlers() : ConsumeHandlers {
    return {
        [AggregatorTrainEvent.BUILD_FINISHED]: async (message: Message) => {
            await handle(message);
        },
        [AggregatorTrainEvent.STARTED]: async (message: Message) => {
            await handle(message);
        },
        [AggregatorTrainEvent.MOVED]: async (message: Message) => {
            await handle(message);
        },
        [AggregatorTrainEvent.FINISHED]: async (message: Message) => {
            await handle(message);
        },
    };
}
