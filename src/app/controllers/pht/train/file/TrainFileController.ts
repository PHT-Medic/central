import path from "path";
import {getRepository} from "typeorm";
import {isPermittedToOperateOnRealmResource} from "../../../../../modules/auth/utils";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../../../../db/utils";
import {TrainFile} from "../../../../../domains/pht/train/file";
import fs from "fs";
import {getWritableDirPath} from "../../../../../config/paths";
import {TrainConfiguratorStateOpen} from "../../../../../domains/pht/train/states";
import {getTrainFileFilePath} from "../../../../../domains/pht/train/file/path";
import {Train} from "../../../../../domains/pht/train";

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
        fs.unlinkSync(getTrainFileFilePath(entity));

        const trainRepository = getRepository(Train);
        await trainRepository.update({id: entity.train_id}, {
            configurator_status: TrainConfiguratorStateOpen,
            hash: null,
            hash_signed: null
        });

        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Zug Dateien konnte nicht gelöscht werden...'})
    }
}
