/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@ebec/http';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runRegistryProjectValidation } from '../utils/validation';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function createRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryProjectValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    const entity = repository.create({
        ecosystem: result.relation.registry.ecosystem,
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
