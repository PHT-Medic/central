/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

export async function deleteRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return res.respondDeleted({ data: entity });
}
