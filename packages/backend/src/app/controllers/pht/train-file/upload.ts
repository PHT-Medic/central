/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Train, TrainFile} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import BusBoy from "busboy";
import path from "path";
import {getWritableDirPath} from "../../../../config/paths";
import fs from "fs";
import {buildMulterFileHandler} from "./busboy";
import crypto from "crypto";

export async function uploadTrainFilesRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.can('add', 'train') && !req.ability.can('edit', 'train')) {
        return res._failForbidden();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    const trainFileRepository = getRepository(TrainFile);

    const busboy = new BusBoy({headers: req.headers, preservePath: true});

    const files: TrainFile[] = [];

    const trainDirectoryPath = path.resolve(getWritableDirPath() + '/train-files');

    try {
        await fs.promises.access(trainDirectoryPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        fs.mkdirSync(trainDirectoryPath, {mode: 0o770});
    }

    busboy.on('file', (filename, file, fullFileName, encoding, mimetype) => {
        const fileHandler = buildMulterFileHandler();
        const hash = crypto.createHash('sha256');

        hash.update(entity.id);
        hash.update(fullFileName);

        const destinationFileName = hash.digest('hex');
        const destinationFilePath = trainDirectoryPath + '/' + destinationFileName + '.file';

        const fd: number = fs.openSync(destinationFilePath, 'w');

        const fileName: string = path.basename(fullFileName);
        const filePath: string = path.dirname(fullFileName);

        file.on('data', (data) => {
            fs.writeSync(fd, data, 0, data.length, null);
            fileHandler.pushFileSize(data.length);
        });

        file.on('limit', () => {
            req.unpipe(busboy);

            fs.closeSync(fd);

            fileHandler.cleanup();

            return res._failBadRequest({
                message: 'Size of file ' + fullFileName + ' is too large...'
            }).end();
        })

        file.on('end', () => {
            fs.closeSync(fd);

            fileHandler.cleanup();

            files.push(trainFileRepository.create({
                hash: destinationFileName,
                name: fileName,
                directory: filePath,
                size: fileHandler.getFileSize(),
                user_id: req.user.id,
                train_id: entity.id,
                realm_id: req.realmId,
            }));
        });
    });

    busboy.on('error', () => {
        req.unpipe(busboy);

        return res._failBadRequest().end();
    })

    busboy.on('finish', async () => {
        if (files.length === 0) {
            return res._failBadRequest({message: 'No train files provided'});
        }

        try {
            await trainFileRepository.save(files);

            await repository.save(repository.merge(entity, {
                configuration_status: null,
                hash: null,
                hash_signed: null
            }))

            return res._respond({
                data: {
                    data: files,
                    meta: {
                        total: files.length
                    }
                }
            });
        } catch (e) {
            return res._failValidationError({message: 'The train files could not be uploaded.'})
        }
    });

    return req.pipe(busboy);
}
