import BusBoy from "busboy";
import path from "path";
import {getRepository} from "typeorm";

import {Train} from "../../../../domains/pht/train";
import {isPermittedToOperateOnRealmResource} from "../../../../services/auth/utils";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../../../db/utils";
import {TrainFile} from "../../../../domains/pht/train/file";
import {buildMulterFileHandler} from "../../../../services/http/busboy";
import fs from "fs";
import {getWritableDirPath} from "../../../../config/paths";
import * as crypto from "crypto";

export async function getTrainFileRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','train') && !req.ability.can('edit','train')) {
        return res._failForbidden();
    }

    const { fileId } = req.params;

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne({
        id: fileId
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getTrainFilesRouteHandler(req: any, res: any) {
    const { id } = req.params;
    let { filter } = req.query;

    const repository = getRepository(TrainFile);
    const query = repository.createQueryBuilder('trainFile')
        .where("trainFile.train_id = :trainId", {trainId: id});

    queryFindPermittedResourcesForRealm(query, req.user.realm_id);

    applyRequestFilterOnQuery(query, filter, {
        id: 'trainFile.id',
        name: 'trainFile.name',
        realmId: 'train.realm_id'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function uploadTrainFilesRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('add','train') && !req.ability.can('edit','train')) {
        return res._failForbidden();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);
    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    const trainFileRepository = getRepository(TrainFile);

    const busboy = new BusBoy({headers: req.headers, preservePath: true});
    req.pipe(busboy);

    let files : TrainFile[] = [];

    const trainDirectoryPath = path.resolve(getWritableDirPath()+'/train-files');

    if(!fs.existsSync(trainDirectoryPath)) {
        fs.mkdirSync(trainDirectoryPath, {mode: 0o770});
    }

    busboy.on('file', (fieldname, file, fullFileName, encoding, mimetype) => {
        const fileHandler = buildMulterFileHandler();
        const hash = crypto.createHash('sha256');

        hash.update(entity.id);
        hash.update(fullFileName);

        const destinationFileName = hash.digest('hex');
        const destinationFilePath = trainDirectoryPath + '/' + destinationFileName+'.file';

        const fd : number = fs.openSync(destinationFilePath, 'w');

        const fileName : string = path.basename(fullFileName);
        const filePath : string = path.dirname(fullFileName);

        file.on('data', (data) => {
            fs.writeSync(fd, data, fileHandler.getFileSize(), data.length, null);
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
                path: filePath,
                size: fileHandler.getFileSize(),
                user_id: req.user.id,
                train_id: entity.id,
                realm_id: req.user.realm_id,
            }));
        });
    });

    busboy.on('error', () => {
        req.unpipe(busboy);

        return res._failBadRequest().end();
    })

    return busboy.on('finish', async () => {
        if(files.length === 0) {
            return res._failBadRequest({message: 'No files provided'});
        }

        try {
            await trainFileRepository.save(files);

            return res._respond({data: files});
        } catch (e) {
            return res._failValidationError({message: 'Der Zug Dateien konnten nicht hochgeladen werden...'})
        }
    });
}

export async function dropTrainFileRouteHandler(req: any, res: any) {
    let { fileId } = req.params;

    if(typeof fileId !== 'string' || !fileId.length) {
        return res._failNotFound();
    }

    if(!req.ability.can('add', 'train') && !req.ability.can('edit','train')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne(fileId);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        const trainDirectoryPath = path.resolve(getWritableDirPath()+'/train-files');
        const trainFilePath = trainDirectoryPath + '/' + entity.hash + '.file';

        fs.unlinkSync(trainFilePath);

        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Zug Dateien konnte nicht gelöscht werden...'})
    }
}
