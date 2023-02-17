/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { publishMessage } from 'amqp-extension';
import {
    Train,
    TrainManagerBuilderCommand,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';

export async function detectTrainBuildStatus(train: TrainEntity | string) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    const queueMessage = buildTrainManagerQueueMessage(
        TrainManagerComponent.BUILDER,
        TrainManagerBuilderCommand.CHECK,
        {
            id: train.id,
        },
    );

    await publishMessage(queueMessage);

    return train;
}
