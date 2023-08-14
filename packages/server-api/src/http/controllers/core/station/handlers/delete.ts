/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/core';
import { isRealmResourceWritable } from '@authup/core';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RegistryCommand } from '../../../../../components';
import { buildRegistryPayload } from '../../../../../components/registry/utils/queue';
import { StationEntity } from '../../../../../domains/station';
import { RegistryProjectEntity } from '../../../../../domains/registry-project/entity';
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

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (
        entity.registry_project_id
    ) {
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

        const registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
        if (registryProject) {
            const queueMessage = buildRegistryPayload({
                command: RegistryCommand.PROJECT_UNLINK,
                data: {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
            });

            await publish(queueMessage);
            await registryProjectRepository.remove(registryProject);
        }
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
