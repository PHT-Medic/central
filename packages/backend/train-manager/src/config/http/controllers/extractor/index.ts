/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'fs';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import path from 'path';
import { HTTPClient, PermissionID } from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { isPermittedForResourceRealm } from '@authelion/common';
import { buildImageOutputFilePath } from '../../../paths';
import { ExpressRequest, ExpressResponse } from '../../type';

export async function streamExtractorFileRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError('The result identifier is invalid.');
    }

    if (!req.ability.has(PermissionID.TRAIN_RESULT_READ)) {
        throw new ForbiddenError('You are not authorized to read the train-result file.');
    }

    const train = await useClient<HTTPClient>().train.getOne(id);
    if (!train) {
        throw new NotFoundError('The referenced database entry does not exist.');
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError('You are not permitted to read the train-result file.');
    }

    const filePath = buildImageOutputFilePath(id);
    const fileName = path.basename(filePath);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK | fs.constants.R_OK);

        const stream = fs.createReadStream(filePath);

        res.set({
            'Content-Disposition': `attachment; filename=${fileName}`,
            'Content-Type': 'application/gzip',
        });

        stream.pipe(res);
    } catch (e) {
        throw new NotFoundError('A train-result which is identified by the provided identifier doesn\'t exist');
    }
}
