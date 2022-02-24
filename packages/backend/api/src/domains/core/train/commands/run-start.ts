/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { Train, TrainRunStatus } from '@personalhealthtrain/central-common';
import { TrainRouterCommand, buildTrainRouterQueueMessage } from '../../../special/train-router';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function startTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (
        !!train.run_status &&
        [TrainRunStatus.STARTING, TrainRunStatus.RUNNING].indexOf(train.run_status) !== -1
    ) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has already been started...');
    } else {
        const queueMessage = await buildTrainRouterQueueMessage(TrainRouterCommand.START, { id: train.id });

        await publishMessage(queueMessage);

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}