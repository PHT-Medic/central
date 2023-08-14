/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainConfigurationStatus } from '@personalhealthtrain/core';
import crypto from 'node:crypto';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../core/minio';
import { streamToBuffer } from '../../../core/utils';
import { generateTrainMinioBucketName } from '../utils';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';
import { TrainFileEntity } from '../../train-file/entity';

export async function generateTrainHash(train: TrainEntity | string) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    const hash = crypto.createHash('sha512');
    // User Hash
    hash.update(Buffer.from(train.user_id.toString(), 'utf-8'));

    // Files
    const trainFilesRepository = dataSource.getRepository(TrainFileEntity);
    const trainFiles = await trainFilesRepository.createQueryBuilder('trainFiles')
        .where('trainFiles.train_id = :id', { id: train.id })
        .getMany();

    const minio = useMinio();
    const bucketName = generateTrainMinioBucketName(train.id);

    const promises : Promise<Buffer>[] = [];

    for (let i = 0; i < trainFiles.length; i++) {
        const promise = new Promise<Buffer>((resolve, reject) => {
            minio.getObject(bucketName, trainFiles[i].hash)
                .then((stream) => streamToBuffer(stream))
                .then((buffer) => resolve(buffer))
                .catch((e) => reject(e));
        });

        promises.push(promise);
    }

    const fileContents = await Promise.all(promises);
    for (let i = 0; i < fileContents.length; i++) {
        hash.update(fileContents[i]);
    }

    // Session id hash
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
