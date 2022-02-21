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
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { TrainEntity } from '../../../../../domains/core/train/entity';

export async function deleteTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT) &&
        !req.ability.hasPermission(PermissionID.TRAIN_APPROVE)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainStationEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.train_realm_id)
    ) {
        throw new ForbiddenError();
    }

    await repository.remove(entity);

    const trainRepository = getRepository(TrainEntity);
    const train = await trainRepository.findOne(entity.train_id);

    train.stations -= 1;
    await trainRepository.save(train);

    return res.respondDeleted({ data: entity });
}
