/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, TrainResult } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { TrainResultEntity } from '../../../../domains/core/train-result/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';

export async function deleteTrainResultRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);

    const entity : TrainResult | undefined = await repository.findOne(id, { relations: ['train'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        throw new ForbiddenError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
