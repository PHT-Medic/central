/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runRegistryValidation } from './utils';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

export async function createRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryValidation(req, 'create');

    const repository = getRepository(RegistryEntity);
    const entity = repository.create({
        realm_id: req.realmId,
        ...result.data,
    });

    await repository.save(entity);

    return res.respond({ data: entity });
}
