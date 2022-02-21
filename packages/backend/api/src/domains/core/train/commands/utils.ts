/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';
import { Repository, getRepository } from 'typeorm';
import { TrainEntity } from '../entity';

export async function findTrain(
    train: Train | number | string,
    repository?: Repository<Train>,
) : Promise<Train | undefined> {
    repository ??= getRepository(TrainEntity);
    return typeof train === 'number' || typeof train === 'string' ? repository.findOne(train) : train;
}
