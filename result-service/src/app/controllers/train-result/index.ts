import fs from 'fs';
import { NotFoundError } from '@typescript-error/http';
import { getTrainResultFilePath } from '../../../config/paths';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';

export async function streamTrainResultRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const { downloadId } = req.query;
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new NotFoundError();
    }

    let resultFileId : string = id;

    if (typeof downloadId === 'string') {
        resultFileId = downloadId;
    }

    const trainResultFilePath = getTrainResultFilePath(resultFileId);
    const downloadFileName = `${id}.tar`;

    // eslint-disable-next-line consistent-return
    return fs.access(trainResultFilePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
        if (err) {
            throw new NotFoundError('A train result which is identified by the provided identifier doesn\'t exist');
        }
        const stream = fs.createReadStream(trainResultFilePath);

        res.set({
            'Content-Disposition': `attachment; filename=${downloadFileName}`,
            'Content-Type': 'application/pdf',
        });

        stream.pipe(res);
    });
}
