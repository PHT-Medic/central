/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, TrainFile } from '@personalhealthtrain/central-common';
import BusBoy, { FileInfo } from 'busboy';
import { UploadedObjectInfo } from 'minio';
import path from 'path';
import crypto from 'crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../../core/minio';
import { streamToBuffer } from '../../../../../core/utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { TrainEntity, generateTrainMinioBucketName } from '../../../../../domains/core/train';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';

export async function uploadTrainFilesRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    const { id } = req.params;

    if (
        !req.ability.has(PermissionID.TRAIN_ADD) &&
        !req.ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    const trainFileRepository = dataSource.getRepository<TrainFile>(TrainFileEntity);

    const instance = BusBoy({ headers: req.headers, preservePath: true });

    const files: TrainFile[] = [];

    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(entity.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }

    const promises : Promise<UploadedObjectInfo>[] = [];

    instance.on('file', (filename, file, info: FileInfo) => {
        const hash = crypto.createHash('sha256');

        hash.update(entity.id);
        hash.update(info.filename);

        const fileName: string = path.basename(info.filename);
        const filePath: string = path.dirname(info.filename);

        const destinationFileName = hash.digest('hex');

        const promise = new Promise<UploadedObjectInfo>((resolve, reject) => {
            streamToBuffer(file)
                .then((buffer) => {
                    const size = Buffer.byteLength(buffer);

                    minio.putObject(
                        bucketName,
                        destinationFileName,
                        buffer,
                        size,
                    )
                        .then((minioInfo) => {
                            files.push(trainFileRepository.create({
                                hash: destinationFileName,
                                name: fileName,
                                size,
                                directory: filePath,
                                user_id: req.user.id,
                                train_id: entity.id,
                                realm_id: req.realmId,
                            }));

                            resolve(minioInfo);
                        })
                        .catch((e) => reject(e));
                })
                .catch((e) => reject(e));
        });

        promises.push(promise);
    });

    instance.on('error', () => {
        req.unpipe(instance);

        throw new BadRequestError();
    });

    instance.on('finish', async () => {
        await Promise.all(promises);

        if (files.length === 0) {
            return res.respond({
                data: {
                    data: [],
                    meta: {
                        total: 0,
                    },
                },
            });
        }

        await trainFileRepository.save(files, { listeners: true });

        entity = repository.merge(entity, {
            hash: null,
            hash_signed: null,
        });

        await repository.save(entity);

        return res.respond({
            data: {
                data: files,
                meta: {
                    total: files.length,
                },
            },
        });
    });

    return req.pipe(instance);
}
