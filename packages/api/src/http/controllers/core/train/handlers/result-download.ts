/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceReadable } from '@authup/common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import type { Request, Response } from 'routup';
import {
    HeaderName, setResponseHeaderAttachment, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../../core/minio';
import { TrainEntity, generateTrainMinioBucketName } from '../../../../../domains/train';
import { useRequestEnv } from '../../../../request';

export async function handleTrainResultDownloadRouteHandler(req: Request, res: Response) {
    const id = useRequestParam(req, 'id');

    if (!id) {
        throw new BadRequestError('The result identifier is invalid.');
    }

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.TRAIN_RESULT_READ)) {
        throw new ForbiddenError('You are not authorized to read the train-result file.');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const entity = await repository.findOneBy({
        id,
    });
    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to read the train-result file.');
    }

    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(entity.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        throw new NotFoundError('The train storage is not yet initialized.');
    }

    try {
        const fileName = `${entity.id}.tar`;

        res.setHeader(HeaderName.CONTENT_TYPE, 'application/gzip');
        setResponseHeaderAttachment(res, fileName);

        const stream = await minio.getObject(bucketName, 'result');

        stream.pipe(res);
    } catch (e) {
        throw new NotFoundError('The train result does not exist in the storage.');
    }
}
