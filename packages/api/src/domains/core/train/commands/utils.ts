/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Repository } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../entity';

export async function findTrain(
    train: TrainEntity | string,
    repository?: Repository<TrainEntity>,
) : Promise<TrainEntity | undefined> {
    if (typeof train !== 'string') {
        return train;
    }

    if (typeof repository === 'undefined') {
        const dataSource = await useDataSource();
        repository = dataSource.getRepository(TrainEntity);
    }

    return repository.findOneBy({ id: train });
}
