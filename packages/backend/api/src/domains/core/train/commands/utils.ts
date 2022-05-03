/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';
import { Repository } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../entity';

export async function findTrain(
    train: Train | number | string,
    repository?: Repository<Train>,
) : Promise<Train | undefined> {
    const dataSource = await useDataSource();

    repository ??= dataSource.getRepository(TrainEntity);
    return typeof train === 'number' || typeof train === 'string' ? repository.findOneBy({ id: `${train}` }) : train;
}
