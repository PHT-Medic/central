/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { Not } from 'typeorm';
import {
    Ecosystem,
    RegistryProjectType,
    Train,
    TrainBuildStatus,
    TrainManagerQueueCommand,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { BadRequestError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { findTrain } from './utils';
import { TrainStationEntity } from '../../train-station/entity';
import { TrainEntity } from '../entity';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { RegistryEntity } from '../../registry/entity';
import { RegistryProjectEntity } from '../../registry-project/entity';

export async function startBuildTrain(
    train: Train | number | string,
) : Promise<Train> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (!train) {
        throw new BadRequestError('The train could not be found.');
    }

    if (train.run_status) {
        throw new BadRequestError('The train can not longer be build...');
    } else {
        const trainStationRepository = dataSource.getRepository(TrainStationEntity);
        const trainStations = await trainStationRepository.findBy({
            train_id: train.id,
            approval_status: Not(TrainStationApprovalStatus.APPROVED),
        });

        if (trainStations.length > 0) {
            throw new BadRequestError('Not all stations have approved the train yet.');
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

        const queueMessage = buildTrainManagerQueueMessage(
            TrainManagerQueueCommand.BUILD,
            {
                id: train.id,
            },
        );

        await publishMessage(queueMessage);

        train = repository.merge(train, {
            build_status: TrainBuildStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}
