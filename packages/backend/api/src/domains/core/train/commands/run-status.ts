/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI,
    HarborRepository,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    Train,
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainRunStatus,
    buildRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useClient } from '@trapi/client';
import { findTrain } from './utils';
import { triggerTrainResultStart } from './result-start';
import { TrainEntity } from '../entity';
import { TrainStationEntity } from '../../train-station/entity';
import { ApiKey } from '../../../../config/api';

export async function detectTrainRunStatus(train: Train | number | string) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    // 1. Check PHT outgoing ( -> TrainFinished )
    let harborRepository: HarborRepository | undefined = await useClient<HarborAPI>(ApiKey.HARBOR).projectRepository
        .find(REGISTRY_OUTGOING_PROJECT_NAME, train.id);

    if (typeof harborRepository !== 'undefined') {
        train = repository.merge(train, {
            build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
            configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
            run_station_id: null, // optional, just to ensure
            run_status: TrainRunStatus.FINISHED,
        });

        // check if we marked the train as terminated yet :O ?
        if (train.run_status !== TrainRunStatus.FINISHED) {
            train = await triggerTrainResultStart(train.id, harborRepository);
        } else {
            train = repository.merge(train, {
                result_last_status: null,
            });
        }

        await repository.save(train);

        return train;
    }

    // 2. Check any Station Repository on route ( -> TrainRunning )
    const trainStationRepository = getRepository(TrainStationEntity);
    const trainStationQueryBuilder = trainStationRepository
        .createQueryBuilder('trainStation')
        .addSelect('station.secure_id')
        .leftJoinAndSelect('trainStation.station', 'station')
        .orderBy({
            'trainStation.position': 'DESC',
            'trainStation.created_at': 'DESC',
        });

    const trainStations = await trainStationQueryBuilder.getMany();

    for (let i = 0; i < trainStations.length; i++) {
        const stationId : string | number | undefined = trainStations[i].station.secure_id ??
            trainStations[i].station.id;

        if (!stationId) continue;

        const stationName : string = buildRegistryStationProjectName(stationId);

        try {
            harborRepository = await useClient<HarborAPI>(ApiKey.HARBOR).projectRepository
                .find(stationName, train.id);

            if (typeof harborRepository !== 'undefined') {
                // update train station status

                train = repository.merge(train, {
                    build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
                    configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
                    run_station_id: trainStations[i].station_id,
                    run_status: TrainRunStatus.RUNNING,
                });

                await repository.save(train);

                return train;
            }
        } catch (e) {
            if (
                typeof e?.response?.status === 'number' &&
                [404, 403].indexOf(e.response.status) !== -1
            ) {
                // eslint-disable-next-line no-continue
                continue;
            }

            throw e;
        }
    }

    // 3. Check PHT incoming ( -> TrainBuilt )
    harborRepository = await useClient<HarborAPI>(ApiKey.HARBOR).projectRepository
        .find(REGISTRY_INCOMING_PROJECT_NAME, train.id);

    if (typeof harborRepository !== 'undefined') {
        train = repository.merge(train, {
            build_status: TrainBuildStatus.FINISHED, // optional, just to ensure
            configuration_status: TrainConfigurationStatus.FINISHED, // optional, just to ensure
            run_station_id: null, // optional, just to ensure
            run_status: null,
        });

        await repository.save(train);

        return train;
    }

    train = repository.merge(train, {
        run_station_id: null,
        run_status: null,
    });

    await repository.save(train);

    return train;
}
