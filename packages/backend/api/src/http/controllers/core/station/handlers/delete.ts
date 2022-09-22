/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isPermittedForResourceRealm } from '@authelion/common';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function deleteStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.has(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
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

    return res.respondDeleted({ data: entity });
}
