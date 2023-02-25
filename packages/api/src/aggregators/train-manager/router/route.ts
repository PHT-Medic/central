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
    TrainRunStatus, TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/central-server-common';
import type {
    RouterRouteEventContext,
} from '@personalhealthtrain/train-manager';
import {
    ComponentName,
    ExtractorCommand,
    RouterEvent,
} from '@personalhealthtrain/train-manager';
import { buildExtractorQueuePayload } from '@personalhealthtrain/train-manager/src/components/extractor/utils';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { RegistryProjectEntity } from '../../../domains/core/registry-project/entity';
import { StationEntity } from '../../../domains/core/station';
import { TrainEntity } from '../../../domains/core/train';
import type { TrainLogSaveContext } from '../../../domains/core/train-log';
import { saveTrainLog } from '../../../domains/core/train-log';
import { TrainStationEntity } from '../../../domains/core/train-station/entity';

export async function handleTrainManagerRouterRouteEvent(context: RouterRouteEventContext) {
    if (context.data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    // -------------------------------------------------------------------------------

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const entity = await repository.findOneBy({ id: context.data.repositoryName });
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
            entity.run_status = TrainRunStatus.FAILED;
            entity.run_station_id = null;
            entity.run_station_index = null;

            entity.result_status = null;

            await repository.save(entity);

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
    }

    await saveTrainLog(trainLogContext);
}
