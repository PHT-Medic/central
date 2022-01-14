/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainBuildStatus } from '@personalhealthtrain/ui-common';
import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { buildTrainBuilderQueueMessage } from '../../../extra/train-builder/queue';
import { TrainBuilderCommand } from '../../../extra/train-builder/type';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';

export async function stopBuildTrain(train: Train | number | string, demo = false) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train build can not longer be stopped...');
    } else {
        // if we already send a stop event, we dont send it again... :)
        if (train.build_status !== TrainBuildStatus.STOPPING) {
            if (!demo) {
                const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.STOP, train);

                await publishMessage(queueMessage);
            }
        }

        train = repository.merge(train, {
            build_status: train.build_status !== TrainBuildStatus.STOPPING ? TrainBuildStatus.STOPPING : TrainBuildStatus.STOPPED,
        });

        await repository.save(train);
    }

    return train;
}
