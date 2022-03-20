/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@authelion/common';
import { runTrainValidation } from './utils';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function updateTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runTrainValidation(req, 'update');
    if (!result.data) {
        return res.respondAccepted();
    }

    const repository = getRepository(TrainEntity);
    let entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
