/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { publishMessage } from 'amqp-extension';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useRequestEnv } from '../../../../request';
import { runRegistryProjectValidation } from '../utils';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

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

    if (!isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    if (
        entity.external_name &&
        result.data.external_name &&
        entity.external_name !== result.data.external_name
    ) {
        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_UNLINK,
            {
                id: entity.id,
                registryId: entity.registry_id,
                externalName: result.data.external_name,
                accountId: result.data.account_id,
            },
        );

        await publishMessage(queueMessage);
    }

    const queueMessage = buildRegistryQueueMessage(
        RegistryQueueCommand.PROJECT_LINK,
        {
            id: entity.id,
        },
    );

    await publishMessage(queueMessage);

    return sendAccepted(res, entity);
}
