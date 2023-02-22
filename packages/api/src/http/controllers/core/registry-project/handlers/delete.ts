/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { isRealmResourceWritable } from '@authup/common';
import { useRequestEnv } from '../../../../request';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryPayload } from '../../../../../domains/special/registry';

export async function deleteRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(RegistryProjectEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    await publish(buildRegistryPayload({
        command: RegistryQueueCommand.PROJECT_UNLINK,
        data: {
            id: entity.id,
            registryId: entity.registry_id,
            externalName: entity.external_name,
            accountId: entity.account_id,
        },
    }));

    return sendAccepted(res, entity);
}
