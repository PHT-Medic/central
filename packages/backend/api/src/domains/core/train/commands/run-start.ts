/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import {
    Train,
    TrainManagerQueueCommand,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';

export async function startTrain(train: Train | number | string) : Promise<Train> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (!train) {
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
        await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.ROUTE_START, {
            id: train.id,
        }));

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}
