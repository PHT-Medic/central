/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import fs from 'fs';
import { useDataSource } from 'typeorm-extension';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { getTrainFileFilePath } from '../../../../../domains/core/train-file/path';
import { TrainEntity } from '../../../../../domains/core/train/entity';

export async function deleteTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { fileId } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);

    const entity = await repository.findOneBy({ id: fileId });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    await fs.promises.unlink(getTrainFileFilePath(entity));

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

    return res.respondDeleted({ data: entity });
}
