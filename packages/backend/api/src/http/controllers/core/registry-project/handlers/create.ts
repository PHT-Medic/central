/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runRegistryProjectValidation } from './utils';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

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

    const queueMessage = buildRegistryQueueMessage(
        RegistryQueueCommand.PROJECT_LINK,
        {
            id: entity.id,
        },
    );

    await publishMessage(queueMessage);

    return res.respond({ data: entity });
}
