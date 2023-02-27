/*
 * Copyright (c) 2022.
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
import { RegistryCommand } from '../../../../../components';
import { buildRegistryPayload } from '../../../../../components/registry/utils/queue';
import { useRequestEnv } from '../../../../request';
import { runRegistryProjectValidation } from '../utils';
import { RegistryProjectEntity } from '../../../../../domains/registry-project/entity';

export async function updateRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)) {
        throw new ForbiddenError();
    }

    const result = await runRegistryProjectValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    if (
        entity.external_name &&
        result.data.external_name &&
        entity.external_name !== result.data.external_name
    ) {
        await publish(buildRegistryPayload({
            command: RegistryCommand.PROJECT_UNLINK,
            data: {
                id: entity.id,
                registryId: entity.registry_id,
                externalName: result.data.external_name,
                accountId: result.data.account_id,
            },
        }));
    }

    await publish(buildRegistryPayload({
        command: RegistryCommand.PROJECT_LINK,
        data: {
            id: entity.id,
        },
    }));

    return sendAccepted(res, entity);
}
