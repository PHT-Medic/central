import fs from 'fs';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import path from 'path';
import { HTTPClient, PermissionID } from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { buildTrainResultFilePath } from '../../../paths';
import { ExpressRequest, ExpressResponse } from '../../type';

export async function streamTrainResultRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError('The result identifier is invalid.');
    }

    if (!req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ)) {
        throw new ForbiddenError('You are not authorized to read the train-result file.');
    }

    const trainResult = await useClient<HTTPClient>().trainResult.getOne(id);
    if (!trainResult) {
        throw new NotFoundError('The referenced database entry does not exist.');
    }

    if (!isPermittedForResourceRealm(req.realmId, trainResult.realm_id)) {
        throw new ForbiddenError('You are not permitted to read the train-result file.');
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
        throw new NotFoundError('A train-result which is identified by the provided identifier doesn\'t exist');
    }
}
