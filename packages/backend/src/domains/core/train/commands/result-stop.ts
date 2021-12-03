/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { Train, TrainResultStatus, TrainRunStatus } from '@personalhealthtrain/ui-common';
import { ResultServiceCommand, buildResultServiceQueueMessage } from '../../../extra/result-service';
import { findTrain } from './utils';

export async function triggerTrainResultStop(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    if (train.result_last_status !== TrainResultStatus.STOPPING) {
        // send queue message
        await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.STOP, {
            trainId: train.id,
            latest: true,
            ...(train.result_last_id ? { id: train.result_last_id } : {}),
        }));
    }

    train = repository.merge(train, {
        result_last_status: train.result_last_status !== TrainResultStatus.STOPPING ? TrainResultStatus.STOPPING : TrainResultStatus.STOPPED,
    });

    await repository.save(train);

    return train;
}
