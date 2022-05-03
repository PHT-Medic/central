/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runRegistryValidation } from './utils';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

export async function updateRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryValidation(req, 'update');
    if (!result.data) {
        return res.respondAccepted();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
