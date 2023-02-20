/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainFile } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import type { FileInfo } from 'busboy';
import BusBoy from 'busboy';
import type { UploadedObjectInfo } from 'minio';
import path from 'node:path';
import crypto from 'node:crypto';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { send, sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ensureMinioBucket, useMinio } from '../../../../../core/minio';
import { streamToBuffer } from '../../../../../core/utils';
import { TrainEntity, generateTrainMinioBucketName } from '../../../../../domains/core/train';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { useRequestEnv } from '../../../../request';

export async function uploadTrainFilesRouteHandler(req: Request, res: Response) {
    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.TRAIN_ADD) &&
        !ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository<TrainFile>(TrainFileEntity);

    const instance = BusBoy({ headers: req.headers, preservePath: true });

    const files: TrainFile[] = [];

    const minio = useMinio();

    let trainId : string | undefined;
    instance.on('field', (name, value) => {
        if (name === 'train_id') {
            trainId = value;
        }
    });

    const promises : Promise<UploadedObjectInfo>[] = [];
    instance.on('file', (filename, file, info: FileInfo) => {
        if (typeof info.filename === 'undefined' || typeof trainId === 'undefined') {
            return;
        }

        const promise = new Promise<UploadedObjectInfo>((resolve, reject) => {
            const hash = crypto.createHash('sha256');

            hash.update(trainId);
            hash.update(info.filename);

            const fileName: string = path.basename(info.filename);
            const filePath: string = path.dirname(info.filename);

            const destinationFileName = hash.digest('hex');

            streamToBuffer(file)
                .then((buffer) => {
                    const bucketName = generateTrainMinioBucketName(trainId);
                    ensureMinioBucket(minio, bucketName)
                        .then(() => {
                            minio.putObject(
                                bucketName,
                                destinationFileName,
                                buffer,
                                buffer.length,
                            )
                                .then((minioInfo) => {
                                    const realm = useRequestEnv(req, 'realm');
                                    files.push(repository.create({
                                        hash: destinationFileName,
                                        name: fileName,
                                        size: buffer.length,
                                        directory: filePath,
                                        user_id: useRequestEnv(req, 'userId'),
                                        train_id: trainId,
                                        realm_id: realm.id,
                                    }));

                                    resolve(minioInfo);
                                })
                                .catch((e) => reject(e));
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

        if (typeof trainId === 'undefined') {
            res.statusCode = 400;
            send(res);
        }

        const bucketName = generateTrainMinioBucketName(trainId);
        const trainRepository = dataSource.getRepository(TrainEntity);
        const train = await trainRepository.findOneBy({ id: trainId });
        if (!train) {
            const objectNames = files.map((file) => file.hash);
            if (objectNames.length > 0) {
                await minio.removeObjects(bucketName, objectNames);
            }

            await minio.removeBucket(bucketName);

            res.statusCode = 400;
            send(res);
            return;
        }

        if (files.length === 0) {
            sendCreated(res, {
                data: [],
                meta: {
                    total: 0,
                },
            });

            return;
        }

        await repository.save(files, { listeners: true });

        train.hash = null;
        train.hash_signed = null;

        await trainRepository.save(train);

        sendCreated(res, {
            data: files,
            meta: {
                total: files.length,
            },
        });
    });

    req.pipe(instance);
}
