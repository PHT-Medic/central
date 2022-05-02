/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainRunStatus } from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { BadRequestError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { TrainRouterCommand, buildTrainRouterQueueMessage } from '../../../special/train-router';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function resetTrain(train: Train | number | string) : Promise<Train> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (!train) {
        throw new BadRequestError('The train could not be found.');
    }

    if (train.run_status === TrainRunStatus.FINISHED) {
        throw new BadRequestError('The train has already been terminated...');
    } else {
        if (train.run_status !== TrainRunStatus.STOPPING) {
            const queueMessage = await buildTrainRouterQueueMessage(TrainRouterCommand.RESET, { id: train.id });

            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            run_status: train.run_status !== TrainRunStatus.STOPPING ? TrainRunStatus.STOPPING : TrainRunStatus.STOPPED,
        });

        await repository.save(train);
    }

    return train;
}
