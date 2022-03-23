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
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function deleteStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(StationEntity);

    const query = repository.createQueryBuilder('station')
        .addSelect('station.secure_id')
        .addSelect('station.registry_project_id')
        .addSelect('station.registry_project_account_id')
        .where({
            id,
        })
        .getOne();

    const entity = await query;

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    // todo: delete registry_project entity & queue message emit

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return res.respondDeleted({ data: entity });
}
