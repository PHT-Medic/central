/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isPermittedForResourceRealm } from '@authelion/common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../../core/minio';
import {
    generateTrainFilesMinioBucketName,
    generateTrainResultsMinioBucketName,
} from '../../../../../domains/core/train-file/path';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function handleTrainResultRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError('The result identifier is invalid.');
    }

    if (!req.ability.has(PermissionID.TRAIN_RESULT_READ)) {
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

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to read the train-result file.');
    }

    const minio = useMinio();

    const bucketName = generateTrainResultsMinioBucketName(entity.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        throw new NotFoundError(' train-result which is identified by the provided identifier doesn\'t exist');
    }

    try {
        const fileName = `${entity.id}.tar`;

        res.set({
            'Content-Disposition': `attachment; filename=${fileName}`,
            'Content-Type': 'application/gzip',
        });

        const stream = await minio.getObject(bucketName, entity.id);

        stream.pipe(res);
    } catch (e) {
        throw new NotFoundError('A train-result which is identified by the provided identifier doesn\'t exist');
    }
}
