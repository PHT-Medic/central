/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, TrainFile } from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import BusBoy from 'busboy';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { createFileStreamHandler } from '../../../../../modules/file-system/utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { getTrainFilesDirectoryPath } from '../../../../../config/pht/train-file/path';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';

export async function uploadTrainFilesRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainEntity);

    let entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const trainFileRepository = getRepository<TrainFile>(TrainFileEntity);

    const instance = BusBoy({ headers: req.headers, preservePath: true });

    const files: TrainFile[] = [];

    // Group files in a directory to group delete ;)
    const trainDirectoryPath = getTrainFilesDirectoryPath(entity.id);

    try {
        await fs.promises.access(trainDirectoryPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        await fs.promises.mkdir(trainDirectoryPath, { mode: 0o770, recursive: true });
    }

    const promises : Promise<void>[] = [];

    instance.on('file', (filename, file, info: Record<string, any>) => {
        const hash = crypto.createHash('sha256');

        hash.update(entity.id);
        hash.update(info.filename);

        const destinationFileName = hash.digest('hex');
        const destinationFilePath = `${trainDirectoryPath}/${destinationFileName}.file`;

        const handler = createFileStreamHandler(destinationFilePath);
        const handlerPromise = handler.getWritePromise();

        file.on('data', (data) => {
            handler.add(data);
        });

        file.on('limit', () => {
            handler.cleanup();
            req.unpipe(instance);

            throw new BadRequestError(`Size of file ${info.filename} is too large...`);
        });

        file.on('end', () => {
            if (
                !info.filename ||
                info.filename.length === 0 ||
                handler.getFileSize() === 0
            ) {
                handler.cleanup();
                return;
            }

            handler.complete();

            const fileName: string = path.basename(info.filename);
            const filePath: string = path.dirname(info.filename);

            files.push(trainFileRepository.create({
                hash: destinationFileName,
                name: fileName,
                directory: filePath,
                size: handler.getFileSize(),
                user_id: req.user.id,
                train_id: entity.id,
                realm_id: req.realmId,
            }));

            promises.push(handlerPromise);
        });
    });

    instance.on('error', () => {
        req.unpipe(instance);

        throw new BadRequestError();
    });

    instance.on('finish', async () => {
        if (files.length === 0) {
            throw new BadRequestError('No files provided.');
        }

        await Promise.all(promises);

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
