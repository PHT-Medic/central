/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import {
    Train,
    TrainContainerPath,
    TrainManagerExtractingMode,
    TrainManagerQueueCommand,
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStart(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    // send queue message
    await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT, {
        id: train.id,

        filePaths: [
            TrainContainerPath.RESULTS,
            TrainContainerPath.CONFIG,
        ],

        mode: TrainManagerExtractingMode.WRITE,
    }));

    train = repository.merge(train, {
        result_status: TrainResultStatus.STARTED,
    });

    await repository.save(train);

    return train;
}
