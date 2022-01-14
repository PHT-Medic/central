/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/ui-common';
import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { ResultServiceCommand, buildResultServiceQueueMessage } from '../../../extra/result-service';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStatus(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    // send queue message
    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.STATUS, {
        trainId: train.id,
        latest: true,
        ...(train.result_last_id ? { id: train.result_last_id } : {}),
    }));

    return train;
}
