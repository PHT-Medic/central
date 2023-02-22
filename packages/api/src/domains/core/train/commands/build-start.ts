/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    Ecosystem,
    RegistryProjectType,
    TrainBuildStatus,
    TrainManagerBuilderCommand,
    TrainManagerComponent,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { buildTrainManagerPayload } from '../../../special/train-manager';
import { RegistryProjectEntity } from '../../registry-project/entity';
import { RegistryEntity } from '../../registry/entity';
import { TrainStationEntity } from '../../train-station/entity';
import { TrainEntity } from '../entity';
import { resolveTrain } from './utils';

export async function startBuildTrain(
    train: TrainEntity | string,
) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    if (train.run_status) {
        throw new BadRequestError('The train can not longer be build...');
    } else {
        const trainStationRepository = dataSource.getRepository(TrainStationEntity);
        const trainStations = await trainStationRepository.findBy({
            train_id: train.id,
        });

        for (let i = 0; i < trainStations.length; i++) {
            if (trainStations[i].approval_status !== TrainStationApprovalStatus.APPROVED) {
                throw new BadRequestError('Not all stations have approved the train yet.');
            }
        }

        if (!train.registry_id) {
            const registryRepository = dataSource.getRepository(RegistryEntity);
            const registry = await registryRepository.findOne({
                where: {
                    ecosystem: Ecosystem.DEFAULT,
                },
            });

            if (!registry) {
                throw new BadRequestError('No registry is registered for the default ecosystem.');
            }

            train.registry_id = registry.id;
        }

        if (!train.incoming_registry_project_id) {
            const projectRepository = dataSource.getRepository(RegistryProjectEntity);
            const project = await projectRepository.findOne({
                where: {
                    registry_id: train.registry_id,
                    type: RegistryProjectType.INCOMING,
                },
            });

            if (!project) {
                throw new BadRequestError('No incoming project is registered for the default ecosystem.');
            }

            train.incoming_registry_project_id = project.id;
        }

        await publish(buildTrainManagerPayload({
            component: TrainManagerComponent.BUILDER,
            command: TrainManagerBuilderCommand.BUILD,
            data: {
                id: train.id,
            },
        }));

        train.build_status = TrainBuildStatus.STARTING;

        await repository.save(train);
    }

    return train;
}
