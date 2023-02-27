/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
    TrainContainerPath,
    TrainRunStatus,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import type { ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/central-server-common';
import type { RouterEventContext } from '@personalhealthtrain/train-manager';
import {
    ComponentName,
    ExtractorCommand,
    RouterCommand,
    RouterEvent,
    buildExtractorQueuePayload,
    isRouterRoutePayload,
} from '@personalhealthtrain/train-manager';
import { publish } from 'amqp-extension';
import type { FindOptionsWhere } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { RegistryProjectEntity } from '../../../domains/registry-project/entity';
import { StationEntity } from '../../../domains/station';
import { TrainEntity } from '../../../domains/train';
import type { TrainLogSaveContext } from '../../../domains/train-log';
import { saveTrainLog } from '../../../domains/train-log';
import { TrainStationEntity } from '../../../domains/train-station/entity';

export async function handleTrainManagerRouterEvent(
    context: RouterEventContext | ComponentContextWithError<RouterEventContext>,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const where : FindOptionsWhere<TrainEntity> = {};

    if (
        isRouterRoutePayload(context.data)
    ) {
        if (context.data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
            return;
        }

        where.id = context.data.repositoryName;
    } else {
        where.id = context.data.id;
    }

    // -------------------------------------------------------------------------------

    const entity = await repository.findOneBy(where);
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    let trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: ComponentName.ROUTER,
        command: context.command,
        event: context.event,
    };

    // -------------------------------------------------------------------------------

    switch (context.event) {
        case RouterEvent.POSITION_FOUND:
        case RouterEvent.ROUTED: {
            const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
            const registryProject = await registryProjectRepository.findOneBy({
                external_name: context.data.projectName,
            });

            if (!registryProject) {
                return;
            }

            switch (registryProject.type) {
                case RegistryProjectType.INCOMING: {
                    entity.run_status = TrainRunStatus.RUNNING;
                    trainLogContext.status = TrainRunStatus.RUNNING;

                    await repository.save(entity);
                    break;
                }
                case RegistryProjectType.OUTGOING: {
                    entity.run_status = TrainRunStatus.FINISHED;
                    trainLogContext.status = TrainRunStatus.FINISHED;

                    entity.outgoing_registry_project_id = registryProject.id;

                    await repository.save(entity);

                    if (context.event === RouterEvent.ROUTED) {
                        await publish(buildExtractorQueuePayload({
                            command: ExtractorCommand.EXTRACT,
                            data: {
                                id: entity.id,

                                filePaths: [
                                    TrainContainerPath.RESULTS,
                                    TrainContainerPath.CONFIG,
                                ],
                            },
                        }));
                    }
                    break;
                }
                case RegistryProjectType.STATION: {
                    entity.run_status = TrainRunStatus.RUNNING;
                    trainLogContext.status = TrainRunStatus.RUNNING;

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

                            if (context.event === RouterEvent.ROUTED) {
                                trainStation.artifact_tag = context.data.artifactTag;

                                // operator was station ;)
                                if (context.data.operator === registryProject.account_name) {
                                    trainStation.run_status = TrainStationRunStatus.DEPARTED;
                                } else {
                                    trainStation.run_status = TrainStationRunStatus.ARRIVED;
                                }
                            }

                            await trainStationRepository.save(trainStation);
                        }
                    }

                    await repository.save(entity);
                    break;
                }
            }

            break;
        }
        case RouterEvent.FAILED: {
            if (context.command === RouterCommand.ROUTE) {
                entity.run_status = TrainRunStatus.FAILED;
                entity.run_station_id = null;
                entity.run_station_index = null;

                entity.result_status = null;

                await repository.save(entity);
            }

            if (
                isComponentContextWithError(context) &&
                context.error instanceof ComponentError
            ) {
                trainLogContext = {
                    ...trainLogContext,
                    status: TrainRunStatus.FAILED,

                    error: true,
                    errorCode: `${context.error.getCode()}`,
                    step: context.error.getStep(),
                };
            }
            break;
        }
        case RouterEvent.POSITION_NOT_FOUND: {
            entity.run_status = null;
            entity.run_station_id = null;
            entity.run_station_index = null;

            entity.result_status = null;

            await repository.save(entity);
            break;
        }
        case RouterEvent.STARTING: {
            entity.run_status = TrainRunStatus.STARTING;
            trainLogContext.status = TrainRunStatus.STARTING;
            break;
        }
        case RouterEvent.STARTED: {
            entity.run_status = TrainRunStatus.STARTED;
            trainLogContext.status = TrainRunStatus.STARTED;

            const trainStationRepository = dataSource.getRepository(TrainStationEntity);
            const trainStations = await trainStationRepository.findBy({
                train_id: entity.id,
            });

            for (let i = 0; i < trainStations.length; i++) {
                trainStations[i].run_status = null;

                await trainStationRepository.save(trainStations[i]);
            }

            await repository.save(entity);
            break;
        }
    }

    await saveTrainLog(trainLogContext);
}
