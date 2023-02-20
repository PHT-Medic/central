/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import tar from 'tar-stream';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/common';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../../../../config';
import { useMinio } from '../../../../../core/minio';
import { streamToBuffer } from '../../../../../core/utils';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { TrainEntity, generateTrainMinioBucketName } from '../../../../../domains/core/train';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { useRequestEnv } from '../../../../request';

export async function handleTrainFilesDownloadRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const train = await repository.findOneBy({ id });

    if (!train) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), train.realm_id)) {
        const proposalStations = await dataSource.getRepository(TrainStationEntity).find({
            where: {
                train_id: train.id,
            },
            relations: ['station'],
        });

        let isPermitted = false;

        for (let i = 0; i < proposalStations.length; i++) {
            if (isRealmResourceReadable(useRequestEnv(req, 'realm'), proposalStations[i].station.realm_id)) {
                isPermitted = true;
                break;
            }
        }

        if (!isPermitted) {
            throw new ForbiddenError('You are not allowed to inspect the train files.');
        }
    }

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const pack = tar.pack();
    pack.pipe(res);

    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(train.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        pack.finalize();

        return;
    }

    const files = await dataSource.getRepository(TrainFileEntity).findBy({
        train_id: train.id,
    });

    if (files.length === 0) {
        pack.finalize();

        return;
    }

    const promises : Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
        const promise = new Promise<void>((resolve, reject) => {
            const file = files[i];

            minio.getObject(bucketName, file.hash)
                .then((stream) => streamToBuffer(stream))
                .then((data) => {
                    let name = '';

                    if (
                        file.directory !== '.' &&
                        file.directory
                    ) {
                        name = `${file.directory}/`;
                    }

                    name += file.name;

                    useLogger().debug(`Packing train file ${name} (${data.byteLength} bytes) for streaming.`);

                    pack.entry({
                        name,
                        size: data.byteLength,
                    }, data, (err) => {
                        if (err) {
                            useLogger().error(`Packing train file ${name} for streaming failed.`);
                            reject(err);

                            return;
                        }

                        useLogger().debug(`Packed train file ${name} for streaming.`);
                        resolve();
                    });
                })
                .catch((e) => reject(e));
        });

        promises.push(promise);
    }

    await Promise.all(promises);

    pack.finalize();
}
