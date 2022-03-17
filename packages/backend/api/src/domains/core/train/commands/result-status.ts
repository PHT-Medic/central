/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_OUTGOING_PROJECT_NAME,
    Train,
    TrainContainerPath,
    TrainManagerExtractionMode, TrainManagerQueueCommand,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStatus(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    // send queue message
    await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.STATUS, {
        repositoryName: train.id,
        projectName: REGISTRY_OUTGOING_PROJECT_NAME,

        mode: TrainManagerExtractionMode.NONE,
    }));

    return train;
}
