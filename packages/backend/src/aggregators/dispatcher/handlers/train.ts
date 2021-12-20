/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainBuildStatus,
    TrainRunStatus,
    TrainStation,
    TrainStationRunStatus,
} from '@personalhealthtrain/ui-common';
import { ConsumeHandlers, Message } from 'amqp-extension';
import { getRepository } from 'typeorm';

export enum AggregatorTrainEvent {
    BUILD_FINISHED = 'trainBuilt',
    STARTED = 'trainStarted',
    MOVED = 'trainMoved',
    FINISHED = 'trainFinished',
}

export function createDispatcherAggregatorTrainHandlers() : ConsumeHandlers {
    return {
        [AggregatorTrainEvent.BUILD_FINISHED]: async (message: Message) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id,
            }, {
                build_status: TrainBuildStatus.FINISHED,
            });
        },
        [AggregatorTrainEvent.STARTED]: async (message: Message) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id,
            }, {
                run_status: TrainRunStatus.RUNNING,
                run_station_id: null,
                run_station_index: 0,
            });
        },
        [AggregatorTrainEvent.MOVED]: async (message: Message) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id,
            }, {
                run_status: TrainRunStatus.RUNNING,
                run_station_id: message.data.stationId,
                run_station_index: message.data.stationIndex,
            });

            const trainStationRepository = getRepository(TrainStation);
            await trainStationRepository.update({
                train_id: message.data.id,
                station_id: message.data.stationId,
            }, {
                run_status: message.data.status as TrainStationRunStatus,
            });
        },
        [AggregatorTrainEvent.FINISHED]: async (message: Message) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id,
            }, {
                run_status: TrainRunStatus.FINISHED,
                run_station_id: null,
            });
        },
    };
}
