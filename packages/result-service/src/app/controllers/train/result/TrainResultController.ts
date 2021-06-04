import fs from "fs";

import {getTrainResultFilePath} from "../../../../modules/pht/result/image";

export async function getTrainResultRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const trainResultFilePath = getTrainResultFilePath(id);

    return fs.access(trainResultFilePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
        if(err) {
            return res._failNotFound({message: 'A train result which is identified by the provided identifier doesn\'t exist'});
        } else {
            return res.download(trainResultFilePath, id+'.tar');
        }
    });
}
