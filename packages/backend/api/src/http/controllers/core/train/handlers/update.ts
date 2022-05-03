/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
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

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (
        entity.registry_id &&
        result.data.registry_id &&
        entity.registry_id !== result.data.registry_id
    ) {
        throw new BadRequestError('The registry can not be changed after it is specified.');
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
