/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
    TrainContainerPath,
    TrainManagerExtractingMode,
    TrainManagerQueueCommand,
    TrainManagerRoutingPayload,
    TrainManagerRoutingQueueEvent,
    TrainRunStatus,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';
import { RegistryProjectEntity } from '../../domains/core/registry-project/entity';
import { StationEntity } from '../../domains/core/station/entity';
import { TrainStationEntity } from '../../domains/core/train-station/entity';
import { buildTrainManagerQueueMessage } from '../../domains/special/train-manager';

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

    // -------------------------------------------------------------------------------

    const dataSource = await useDataSource();
    const trainRepository = dataSource.getRepository(TrainEntity);
    const train = await trainRepository.findOneBy({ id: data.repositoryName });
    if (!train) {
        return;
    }

    // -------------------------------------------------------------------------------

    switch (event) {
        case TrainManagerRoutingQueueEvent.STARTED: {
            train.run_status = TrainRunStatus.STARTED;

            const trainStationRepository = dataSource.getRepository(TrainStationEntity);
            const trainStations = await trainStationRepository.findBy({
                train_id: train.id,
            });

            for (let i = 0; i < trainStations.length; i++) {
                trainStations[i].run_status = null;

                await trainStationRepository.save(trainStations[i]);
            }

            await trainRepository.save(train);
            break;
        }
        case TrainManagerRoutingQueueEvent.POSITION_FOUND:
        case TrainManagerRoutingQueueEvent.MOVE_FINISHED: {
            const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjectRepository.findOneBy({
                external_name: data.projectName,
            });

            if (!registryProject) {
                return;
            }

            switch (registryProject.type) {
                case RegistryProjectType.INCOMING: {
                    train.run_status = TrainRunStatus.RUNNING;

                    await trainRepository.save(train);
                    break;
                }
                case RegistryProjectType.OUTGOING: {
                    train.run_status = TrainRunStatus.FINISHED;
                    train.outgoing_registry_project_id = registryProject.id;

                    await trainRepository.save(train);

                    if (event === TrainManagerRoutingQueueEvent.MOVE_FINISHED) {
                        await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT, {
                            id: train.id,

                            filePaths: [
                                TrainContainerPath.RESULTS,
                                TrainContainerPath.CONFIG,
                            ],

                            mode: TrainManagerExtractingMode.WRITE,
                        }));
                    }
                    break;
                }
                case RegistryProjectType.STATION: {
                    train.run_status = TrainRunStatus.RUNNING;

                    const stationRepository = dataSource.getRepository(StationEntity);
                    const station = await stationRepository.findOneBy({
                        registry_project_id: registryProject.id,
                    });

                    if (station) {
                        const trainStationRepository = dataSource.getRepository(TrainStationEntity);
                        const trainStation = await trainStationRepository.findOneBy({
                            train_id: train.id,
                            station_id: station.id,
                        });

                        if (trainStation) {
                            train.run_station_index = trainStation.index;
                            train.run_station_id = trainStation.station_id;

                            if (event === TrainManagerRoutingQueueEvent.MOVE_FINISHED) {
                                trainStation.artifact_tag = data.artifactTag;

                                // operator was station ;)
                                if (data.operator === registryProject.account_name) {
                                    trainStation.run_status = TrainStationRunStatus.DEPARTED;
                                } else {
                                    trainStation.run_status = TrainStationRunStatus.ARRIVED;
                                }
                            }

                            await trainStationRepository.save(trainStation);
                        }
                    }

                    await trainRepository.save(train);
                    break;
                }
            }

            break;
        }
        case TrainManagerRoutingQueueEvent.FAILED: {
            train.run_status = TrainRunStatus.FAILED;
            train.run_station_id = null;
            train.run_station_index = null;

            train.result_status = null;

            await trainRepository.save(train);
            break;
        }
        case TrainManagerRoutingQueueEvent.POSITION_NOT_FOUND: {
            train.run_status = null;
            train.run_station_id = null;
            train.run_station_index = null;

            train.result_status = null;

            await trainRepository.save(train);
            break;
        }
    }
}
