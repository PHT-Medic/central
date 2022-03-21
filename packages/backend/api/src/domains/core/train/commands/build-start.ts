/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { Not, getRepository } from 'typeorm';
import {
    Train,
    TrainBuildStatus,
    TrainManagerQueueCommand,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { buildTrainBuilderQueueMessage } from '../../../special/train-builder/queue';
import { TrainBuilderCommand } from '../../../special/train-builder/type';
import { findTrain } from './utils';
import { TrainStationEntity } from '../../train-station/entity';
import { TrainEntity } from '../entity';
import env from '../../../../env';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';

export async function startBuildTrain(
    train: Train | number | string,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train can not longer be build...');
    } else {
        const trainStationRepository = getRepository(TrainStationEntity);
        const trainStations = await trainStationRepository.find({
            train_id: train.id,
            approval_status: Not(TrainStationApprovalStatus.APPROVED),
        });

        if (trainStations.length > 0) {
            // todo: make it a ClientError.NotFound
            throw new Error('Not all stations have approved the train yet.');
        }

        if (env.trainManagerForBuilding) {
            const queueMessage = buildTrainManagerQueueMessage(
                TrainManagerQueueCommand.BUILD,
                {
                    id: train.id,
                },
            );

            await publishMessage(queueMessage);
        } else {
            const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.START, train);
            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            build_status: TrainBuildStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}
