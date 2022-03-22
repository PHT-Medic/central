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
import { runRegistryProjectValidation } from './utils';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

export async function createRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryProjectValidation(req, 'create');

    const repository = getRepository(RegistryProjectEntity);
    const entity = repository.create({
        realm_id: req.realmId,
        ecosystem: result.meta.registry.ecosystem,
        ...result.data,
    });

    await repository.save(entity);

    return res.respond({ data: entity });
}
