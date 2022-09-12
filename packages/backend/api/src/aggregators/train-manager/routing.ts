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
    TrainManagerComponent,
    TrainManagerExtractorCommand,
    TrainManagerRouterCommand,
    TrainManagerRouterEvent,
    TrainManagerRouterRoutePayload,
    TrainRunStatus,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { Message, publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../../domains/core/train/entity';
import { RegistryProjectEntity } from '../../domains/core/registry-project/entity';
import { StationEntity } from '../../domains/core/station/entity';
import { TrainStationEntity } from '../../domains/core/train-station/entity';
import { buildTrainManagerQueueMessage } from '../../domains/special/train-manager';
import { saveTrainLog } from '../../domains/core/train-log';

export async function handleTrainManagerRouterEvent(
    command: TrainManagerRouterCommand,
    event: TrainManagerRouterEvent,
    message: Message,
) {
    const data = message.data as TrainManagerRouterRoutePayload;

    if (data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    // -------------------------------------------------------------------------------

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const entity = await repository.findOneBy({ id: data.repositoryName });
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    switch (event) {
        case TrainManagerRouterEvent.STARTED: {
            entity.run_status = TrainRunStatus.STARTED;

            const trainStationRepository = dataSource.getRepository(TrainStationEntity);
            const trainStations = await trainStationRepository.findBy({
                train_id: entity.id,
            });

            for (let i = 0; i < trainStations.length; i++) {
                trainStations[i].run_status = null;

                await trainStationRepository.save(trainStations[i]);
            }

            await repository.save(entity);

            await saveTrainLog({
                train: entity,
                component: TrainManagerComponent.ROUTER,
            });
            break;
        }
        case TrainManagerRouterEvent.POSITION_FOUND:
        case TrainManagerRouterEvent.ROUTED: {
            const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjectRepository.findOneBy({
                external_name: data.projectName,
            });

            if (!registryProject) {
                return;
            }

            switch (registryProject.type) {
                case RegistryProjectType.INCOMING: {
                    entity.run_status = TrainRunStatus.RUNNING;

                    await repository.save(entity);

                    await saveTrainLog({
                        train: entity,
                        component: TrainManagerComponent.ROUTER,
                    });
                    break;
                }
                case RegistryProjectType.OUTGOING: {
                    entity.run_status = TrainRunStatus.FINISHED;
                    entity.outgoing_registry_project_id = registryProject.id;

                    await repository.save(entity);

                    await saveTrainLog({
                        train: entity,
                        component: TrainManagerComponent.ROUTER,
                    });

                    if (event === TrainManagerRouterEvent.ROUTED) {
                        await publishMessage(buildTrainManagerQueueMessage(
                            TrainManagerComponent.EXTRACTOR,
                            TrainManagerExtractorCommand.EXTRACT,
                            {
                                id: entity.id,

                                filePaths: [
                                    TrainContainerPath.RESULTS,
                                    TrainContainerPath.CONFIG,
                                ],
                            },
                        ));
                    }
                    break;
                }
                case RegistryProjectType.STATION: {
                    entity.run_status = TrainRunStatus.RUNNING;

                    const stationRepository = dataSource.getRepository(StationEntity);
                    const station = await stationRepository.findOneBy({
                        registry_project_id: registryProject.id,
                    });

                    if (station) {
                        const trainStationRepository = dataSource.getRepository(TrainStationEntity);
                        const trainStation = await trainStationRepository.findOneBy({
                            train_id: entity.id,
                            station_id: station.id,
                        });

                        if (trainStation) {
                            entity.run_station_index = trainStation.index;
                            entity.run_station_id = trainStation.station_id;

                            if (event === TrainManagerRouterEvent.ROUTED) {
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

                    await repository.save(entity);

                    await saveTrainLog({
                        train: entity,
                        component: TrainManagerComponent.ROUTER,
                    });
                    break;
                }
            }

            break;
        }
        case TrainManagerRouterEvent.FAILED: {
            entity.run_status = TrainRunStatus.FAILED;
            entity.run_station_id = null;
            entity.run_station_index = null;

            entity.result_status = null;

            await repository.save(entity);

            await saveTrainLog({
                train: entity,
                component: TrainManagerComponent.ROUTER,
            });
            break;
        }
        case TrainManagerRouterEvent.POSITION_NOT_FOUND: {
            entity.run_status = null;
            entity.run_station_id = null;
            entity.run_station_index = null;

            entity.result_status = null;

            await repository.save(entity);

            await saveTrainLog({
                train: entity,
                component: TrainManagerComponent.ROUTER,
            });
            break;
        }
    }
}
