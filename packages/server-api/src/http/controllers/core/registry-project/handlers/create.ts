/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/core';
import { ForbiddenError } from '@ebec/http';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RegistryCommand } from '../../../../../components';
import { buildRegistryPayload } from '../../../../../components/registry/utils/queue';
import { useRequestEnv } from '../../../../request';
import { runRegistryProjectValidation } from '../utils';
import { RegistryProjectEntity } from '../../../../../domains/registry-project/entity';

export async function createRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)) {
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

    await publish(buildRegistryPayload({
        command: RegistryCommand.PROJECT_LINK,
        data: {
            id: entity.id,
        },
    }));

    return sendCreated(res, entity);
}
