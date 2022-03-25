/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { Not, getRepository } from 'typeorm';
import {
    Ecosystem,
    RegistryProjectType,
    Train,
    TrainBuildStatus,
    TrainManagerQueueCommand,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { BadRequestError } from '@typescript-error/http';
import { findTrain } from './utils';
import { TrainStationEntity } from '../../train-station/entity';
import { TrainEntity } from '../entity';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { RegistryEntity } from '../../registry/entity';
import { RegistryProjectEntity } from '../../registry-project/entity';

export async function startBuildTrain(
    train: Train | number | string,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new BadRequestError('The train could not be found.');
    }

    if (!train.registry_id) {
        throw new BadRequestError('A train registry is required to build a train.');
    }

    if (train.run_status) {
        throw new BadRequestError('The train can not longer be build...');
    } else {
        const trainStationRepository = getRepository(TrainStationEntity);
        const trainStations = await trainStationRepository.find({
            train_id: train.id,
            approval_status: Not(TrainStationApprovalStatus.APPROVED),
        });

        if (trainStations.length > 0) {
            throw new BadRequestError('Not all stations have approved the train yet.');
        }

        if (!train.registry_id) {
            const registryRepository = getRepository(RegistryEntity);
            const registry = await registryRepository.findOne({
                where: {
                    ecosystem: Ecosystem.DEFAULT,
                },
            });

            if (typeof registry === 'undefined') {
                throw new BadRequestError('No registry is registered for the default ecosystem.');
            }

            train.registry_id = registry.id;
        }

        if (!train.build_registry_project_id) {
            const projectRepository = getRepository(RegistryProjectEntity);
            const project = await projectRepository.findOne({
                where: {
                    registry_id: train.registry_id,
                    type: RegistryProjectType.INCOMING,
                },
            });

            if (typeof project === 'undefined') {
                throw new BadRequestError('No incoming project is registered for the default ecosystem.');
            }

            train.build_registry_project_id = project.id;
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
