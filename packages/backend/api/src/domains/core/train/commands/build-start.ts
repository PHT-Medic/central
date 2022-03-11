/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { Not, getRepository } from 'typeorm';
import {
    Train, TrainBuildStatus, TrainConfigurationStatus, TrainResultStatus, TrainRunStatus, TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import { buildTrainBuilderQueueMessage } from '../../../special/train-builder/queue';
import { TrainBuilderCommand } from '../../../special/train-builder/type';
import { findTrain } from './utils';
import { TrainStationEntity } from '../../train-station/entity';
import { TrainEntity } from '../entity';

export async function startBuildTrain(
    train: Train | number | string,
    demo = false,
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
        if (!demo) {
            const trainStationRepository = getRepository(TrainStationEntity);
            const trainStations = await trainStationRepository.find({
                train_id: train.id,
                approval_status: Not(TrainStationApprovalStatus.APPROVED),
            });

            if (trainStations.length > 0) {
                // todo: make it a ClientError.NotFound
                throw new Error('Not all stations have approved the train yet.');
            }

            const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.START, train);

            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            configuration_status: TrainConfigurationStatus.FINISHED,
            run_status: demo ? TrainRunStatus.FINISHED : null,
            build_status: demo ? null : TrainBuildStatus.STARTING,
            result_status: demo ? TrainResultStatus.FINISHED : null,
        });

        await repository.save(train);
    }

    return train;
}
