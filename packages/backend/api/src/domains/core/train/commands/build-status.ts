/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { Train, TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';

export async function detectTrainBuildStatus(train: Train | number | string) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    const queueMessage = buildTrainManagerQueueMessage(
        TrainManagerQueueCommand.BUILD_STATUS,
        {
            id: train.id,
        },
    );

    await publishMessage(queueMessage);

    return train;
}
