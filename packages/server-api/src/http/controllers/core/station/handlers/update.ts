/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    PermissionID, RegistryProjectType, createNanoID, isHex,
} from '@personalhealthtrain/core';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RegistryCommand } from '../../../../../components';
import { buildRegistryPayload } from '../../../../../components/registry/utils/queue';
import { useRequestEnv } from '../../../../request';
import { runStationValidation } from '../utils';
import { StationEntity } from '../../../../../domains/station';
import { RegistryProjectEntity } from '../../../../../domains/registry-project/entity';

export async function updateStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.STATION_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runStationValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.public_key',
            'station.external_name',
        ])
        .where('station.id = :id', { id });

    let entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (
        result.data.public_key &&
        result.data.public_key !== entity.public_key &&
        !isHex(result.data.public_key)
    ) {
        result.data.public_key = Buffer.from(result.data.public_key, 'utf8').toString('hex');
    }

    entity = repository.merge(entity, result.data);

    if (
        entity.ecosystem === Ecosystem.DEFAULT &&
        entity.registry_id
    ) {
        const registryProjectExternalName = entity.external_name || createNanoID();
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

        let registryProject : RegistryProjectEntity | undefined;
        if (entity.registry_project_id) {
            registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
        }

        let registryOperation : 'link' | 'relink' = 'link';
        if (registryProject) {
            if (registryProject.external_name !== registryProjectExternalName) {
                registryProject = registryProjectRepository.merge(registryProject, {
                    external_name: registryProjectExternalName,
                    realm_id: entity.realm_id,
                });

                registryOperation = 'relink';
            }
        } else {
            registryProject = registryProjectRepository.create({
                external_name: registryProjectExternalName,
                name: entity.name,
                ecosystem: entity.ecosystem,
                type: RegistryProjectType.STATION,
                realm_id: entity.realm_id,
                registry_id: entity.registry_id,
                public: false,
            });
        }

        await registryProjectRepository.save(registryProject);

        entity.registry_project_id = registryProject.id;
        entity.external_name = registryProjectExternalName;

        if (registryOperation === 'link') {
            await publish(buildRegistryPayload({
                command: RegistryCommand.PROJECT_LINK,
                data: {
                    id: registryProject.id,
                },
            }));
        } else {
            await publish(buildRegistryPayload({
                command: RegistryCommand.PROJECT_RELINK,
                data: {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
            }));
        }
    }

    await repository.save(entity);

    return sendAccepted(res, entity);
}
