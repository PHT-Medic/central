/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {PermissionID, Train, TrainFile} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import BusBoy from "busboy";
import path from "path";
import {getWritableDirPath} from "../../../../config/paths";
import fs from "fs";
import crypto from "crypto";
import {createFileStreamHandler} from "../../../../modules/file-system/utils";
import {ExpressRequest, ExpressResponse} from "../../../../config/http/type";
import {BadRequestError, ForbiddenError, NotFoundError} from "@typescript-error/http";

export async function uploadTrainFilesRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    const {id} = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const trainFileRepository = getRepository(TrainFile);

    const instance = new BusBoy({headers: req.headers as BusBoy.BusboyHeaders, preservePath: true});

    const files: TrainFile[] = [];

    const trainDirectoryPath = path.resolve(getWritableDirPath() + '/train-files');

    try {
        await fs.promises.access(trainDirectoryPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        fs.mkdirSync(trainDirectoryPath, {mode: 0o770});
    }

    const promises : Promise<void>[] = [];

    instance.on('file', (filename, file, fullFileName) => {
        const hash = crypto.createHash('sha256');

        hash.update(entity.id);
        hash.update(fullFileName);

        const destinationFileName = hash.digest('hex');
        const destinationFilePath = trainDirectoryPath + '/' + destinationFileName + '.file';

        const handler =  createFileStreamHandler(destinationFilePath);
        const handlerPromise = handler.getWritePromise();

        file.on('data', (data) => {
            handler.add(data);
        });

        file.on('limit', () => {
            handler.cleanup();
            req.unpipe(instance);

            throw new BadRequestError('Size of file ' + fullFileName + ' is too large...');
        })

        file.on('end', () => {
            if(!fullFileName && handler.getFileSize() === 0) {
                handler.cleanup();
                return;
            }

            handler.complete();

            const fileName: string = path.basename(fullFileName);
            const filePath: string = path.dirname(fullFileName);

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
    })

    instance.on('finish', async () => {
        if (files.length === 0) {
            throw new BadRequestError('No files provided.');
        }

        await Promise.all(promises);

        await trainFileRepository.save(files);

        await repository.save(repository.merge(entity, {
            configuration_status: null,
            hash: null,
            hash_signed: null
        }))

        return res.respond({
            data: {
                data: files,
                meta: {
                    total: files.length
                }
            }
        });

    });

    return req.pipe(instance);
}
