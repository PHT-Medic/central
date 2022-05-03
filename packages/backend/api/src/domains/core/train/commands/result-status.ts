/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainManagerExtractingMode, TrainManagerQueueCommand,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStatus(
    train: string | Train,
) : Promise<Train> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    // send queue message
    await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT_STATUS, {
        id: train.id,

        mode: TrainManagerExtractingMode.NONE,
    }));

    return train;
}
