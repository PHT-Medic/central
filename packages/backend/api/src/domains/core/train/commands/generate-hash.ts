/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainConfigurationStatus } from '@personalhealthtrain/central-common';
import crypto from 'crypto';
import fs from 'fs';
import { useDataSource } from 'typeorm-extension';
import { getTrainFileFilePath } from '../../train-file/path';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';
import { TrainFileEntity } from '../../train-file/entity';

export async function generateTrainHash(train: Train | number | string) : Promise<Train> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (!train) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    const hash = crypto.createHash('sha512');
    // User Hash
    hash.update(Buffer.from(train.user_id.toString(), 'utf-8'));

    // Files
    const trainFilesRepository = dataSource.getRepository(TrainFileEntity);
    const trainFiles = await trainFilesRepository.createQueryBuilder('trainFiles')
        .where('trainFiles.train_id = :id', { id: train.id })
        .getMany();

    for (let i = 0; i < trainFiles.length; i++) {
        const filePath = getTrainFileFilePath(trainFiles[i]);

        const fileContent = fs.readFileSync(filePath);

        // File Hash
        hash.update(fileContent);
    }

    // Session Id hash
    const sessionId: Buffer = crypto.randomBytes(64);
    hash.update(sessionId);

    train.session_id = sessionId.toString('hex');

    if (
        train.query &&
        train.query.length > 0
    ) {
        let { query } = train;
        if (typeof query !== 'string') {
            query = JSON.stringify(query);
        }

        hash.update(Buffer.from(query, 'utf-8'));
    }

    train.hash = hash.digest('hex');
    train.configuration_status = TrainConfigurationStatus.HASH_GENERATED;

    train = await repository.save(train);

    return train;
}
