/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import {
    REGISTRY_OUTGOING_PROJECT_NAME,
    Train, TrainExtractorMode, TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { TrainExtractorQueueCommand, buildTrainExtractorQueueMessage } from '../../../special/train-extractor';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStop(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    if (train.result_status !== TrainResultStatus.STOPPING) {
        // send queue message
        await publishMessage(buildTrainExtractorQueueMessage(TrainExtractorQueueCommand.STOP, {
            repositoryName: train.id,
            projectName: REGISTRY_OUTGOING_PROJECT_NAME,

            mode: TrainExtractorMode.NONE,
        }));
    }

    train = repository.merge(train, {
        result_status: train.result_status !== TrainResultStatus.STOPPING ?
            TrainResultStatus.STOPPING :
            TrainResultStatus.STOPPED,
    });

    await repository.save(train);

    return train;
}
