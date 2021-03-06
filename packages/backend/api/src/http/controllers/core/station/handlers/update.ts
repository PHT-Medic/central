/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    PermissionID, RegistryProjectType, createNanoID, isHex,
} from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { Message, publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { runStationValidation } from '../utils';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function updateStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runStationValidation(req, 'update');
    if (!result.data) {
        return res.respondAccepted();
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

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
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

        let queueMessage : Message;

        if (registryOperation === 'link') {
            queueMessage = buildRegistryQueueMessage(
                RegistryQueueCommand.PROJECT_LINK,
                {
                    id: registryProject.id,
                },
            );
        } else {
            queueMessage = buildRegistryQueueMessage(
                RegistryQueueCommand.PROJECT_RELINK,
                {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
            );
        }

        await publishMessage(queueMessage);
    }

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
