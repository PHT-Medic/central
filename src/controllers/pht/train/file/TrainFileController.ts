import {getRepository} from "typeorm";
import {Train} from "../../../../domains/pht/train";
import {isPermittedToOperateOnRealmResource} from "../../../../services/auth/utils";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../../../db/utils";
import {TrainFile} from "../../../../domains/pht/train/file";

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

    const files = req.files;

    if(!files || Object.keys(files).length === 0) {
        return res._respondAccepted();
    }

    const trainFileRepository = getRepository(TrainFile);

    let trainFiles : TrainFile[] = [];

    for(let key in files) {
        if(!files.hasOwnProperty(key)) {
            continue;
        }

        trainFiles.push(trainFileRepository.create({
            content: files[key].data.toString('UTF-8'),
            user_id: req.user.id,
            train_id: entity.id,
            realm_id: req.user.realm_id,
            name: files[key].name
        }))
    }

    try {
        await trainFileRepository.save(trainFiles);

        return res._respond({data: trainFiles});
    } catch (e) {
        return res._failValidationError({message: 'Der Zug Dateien konnten nicht hochgeladen werden...'})
    }
}

export async function dropTrainFileRouteHandler(req: any, res: any) {
    let { fileId } = req.params;

    fileId = parseInt(fileId);

    if(typeof fileId !== 'number' || Number.isNaN(fileId)) {
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
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Zug Dateien konnte nicht gelöscht werden...'})
    }
}
