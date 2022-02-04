import fs from 'fs';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import path from 'path';
import { buildTrainResultFilePath } from '../../../config/paths';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';

export async function streamTrainResultRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const { downloadId } = req.query;

    let { id } = req.params;

    if (downloadId) {
        id = `${downloadId}`;
    }

    if (!id) {
        throw new BadRequestError('The result identifier is invalid.');
    }

    const filePath = buildTrainResultFilePath(id);
    const fileName = path.basename(filePath);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK | fs.constants.R_OK);

        const stream = fs.createReadStream(filePath);

        res.set({
            'Content-Disposition': `attachment; filename=${fileName}`,
            'Content-Type': 'application/pdf',
        });

        stream.pipe(res);
    } catch (e) {
        throw new NotFoundError('A train result which is identified by the provided identifier doesn\'t exist');
    }
}
