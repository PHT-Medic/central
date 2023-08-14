/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { TrainBuildStatus } from '@personalhealthtrain/core';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';

export async function stopBuildTrain(train: TrainEntity | string) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    if (train.run_status) {
        throw new BadRequestError('The train build can not longer be stopped...');
    } else {
        // if we already send a stop event, we dont send it again... :)
        if (train.build_status !== TrainBuildStatus.STOPPING) {
            // todo: implement stop routine
        }

        train = repository.merge(train, {
            build_status: train.build_status !== TrainBuildStatus.STOPPING ?
                TrainBuildStatus.STOPPING :
                TrainBuildStatus.STOPPED,
        });

        await repository.save(train);
    }

    return train;
}
