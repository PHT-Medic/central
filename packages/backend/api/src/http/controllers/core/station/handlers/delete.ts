/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isRealmResourceWritable } from '@authup/common';
import { publishMessage } from 'amqp-extension';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';
import { useRequestEnv } from '../../../../request';

export async function deleteStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (
        entity.registry_project_id
    ) {
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

        const registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
        if (registryProject) {
            const queueMessage = buildRegistryQueueMessage(
                RegistryQueueCommand.PROJECT_UNLINK,
                {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
            );

            await publishMessage(queueMessage);
            await registryProjectRepository.remove(registryProject);
        }
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
