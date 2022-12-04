/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../../core/minio';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { useRequestEnv } from '../../../../request';
import { TrainEntity, generateTrainMinioBucketName } from '../../../../../domains/core/train';

export async function deleteTrainFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'filedId');

    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.TRAIN_ADD) &&
        !ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const minio = useMinio();
    const bucketName = generateTrainMinioBucketName(entity.train_id);
    try {
        await minio.removeObject(bucketName, entity.hash);
    } catch (e) {
        // do nothing
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    // train
    const trainRepository = dataSource.getRepository(TrainEntity);
    let train = await trainRepository.findOneBy({ id: entity.train_id });
    train = trainRepository.merge(train, {
        hash: null,
        hash_signed: null,
    });
    await trainRepository.save(train);

    return sendAccepted(res, entity);
}
