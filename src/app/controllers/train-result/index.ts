import fs from 'fs';
import { getTrainResultFilePath } from '../../../config/paths';

export async function getTrainResultRouteHandler(req: any, res: any) {
    const { downloadId } = req.query;
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
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
            return res._failNotFound({ message: 'A train result which is identified by the provided identifier doesn\'t exist' });
        }
        const stream = fs.createReadStream(trainResultFilePath);

        res.set({
            'Content-Disposition': `attachment; filename=${downloadFileName}`,
            'Content-Type': 'application/pdf',
        });

        stream.pipe(res);
    });
}
