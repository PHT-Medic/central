import {getRepository} from "typeorm";
import {TrainResult} from "../../../../domains/pht/train/result";
import {TrainResultStateFinished} from "../../../../domains/pht/train/result/states";
import fs from "fs";
import {getTrainResultFilePath} from "../../../../services/pht/result/image";

export async function getTrainResultRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const repository = getRepository(TrainResult);

    const entity = await repository.findOne({
        train_id: id,
    }, {relations: ['train']});

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(entity.status !== TrainResultStateFinished) {
        return res._failBadRequest({message: 'The result is not available yet...'});
    }

    //if(!isPermittedToOperateOnRealmResource(req.user, entity.train)) {
    //    return res._failForbidden();
    //}

    const trainResultFilePath = getTrainResultFilePath(entity.id);

    try {
        await fs.promises.access(trainResultFilePath, fs.constants.R_OK);
    } catch (e) {
        return res._failServerError({message: 'The result file could not be read...'});
    }

    return res.download(trainResultFilePath, entity.train_id+'.tar');
}
