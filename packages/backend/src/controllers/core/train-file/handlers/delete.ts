/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import fs from 'fs';
import { TrainFileEntity } from '../../../../domains/core/train-file/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { getTrainFileFilePath } from '../../../../config/pht/train-file/path';
import { TrainEntity } from '../../../../domains/core/train/entity';

export async function deleteTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { fileId } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainFileEntity);

    const entity = await repository.findOne(fileId);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    await fs.promises.unlink(getTrainFileFilePath(entity));

    await repository.remove(entity);

    // train
    const trainRepository = getRepository(TrainEntity);
    let train = await trainRepository.findOne(entity.train_id);
    train = trainRepository.merge(train, {
        hash: null,
        hash_signed: null,
    });
    await trainRepository.save(train);

    return res.respondDeleted({ data: entity });
}
