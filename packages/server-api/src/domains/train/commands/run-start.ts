/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { RouterCommand, buildRouterQueuePayload } from '@personalhealthtrain/server-train-manager';
import { publish } from 'amqp-extension';
import {
    TrainRunStatus,
} from '@personalhealthtrain/core';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';

export async function startTrain(train: TrainEntity | string) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    if (
        !!train.run_status &&
        [TrainRunStatus.STARTING, TrainRunStatus.RUNNING].indexOf(train.run_status) !== -1
    ) {
        throw new BadRequestError('The train has already been started...');
    } else {
        await publish(buildRouterQueuePayload({
            command: RouterCommand.START,
            data: {
                id: train.id,
            },
        }));

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}
