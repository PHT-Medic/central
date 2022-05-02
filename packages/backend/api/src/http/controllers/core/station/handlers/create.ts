/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, RegistryProjectType, createNanoID, isHex,
} from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError } from '@typescript-error/http';
import { validationResult } from 'express-validator';
import { publishMessage } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { ExpressValidationError } from '../../../../express-validation';
import { runStationValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function createStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.STATION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const result = await runStationValidation(req, 'create');

    if (
        result.data.public_key &&
        !isHex(result.data.public_key)
    ) {
        result.data.public_key = Buffer.from(result.data.public_key, 'utf8').toString('hex');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);

    const entity = repository.create(result.data);

    // -----------------------------------------------------

    if (!entity.ecosystem) {
        entity.ecosystem = result.meta.registry.ecosystem;
    }

    if (
        entity.registry_id
    ) {
        if (entity.ecosystem !== result.meta.registry.ecosystem) {
            throw new BadRequestError('The ecosystem of the station and the registry must be the same.');
        }

        const registryProjectExternalName = entity.external_name || createNanoID();
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
        const registryProject = registryProjectRepository.create({
            external_name: registryProjectExternalName,
            name: entity.name,
            ecosystem: entity.ecosystem,
            type: RegistryProjectType.STATION,
            registry_id: entity.registry_id,
            realm_id: entity.realm_id,
            public: false,
        });

        await registryProjectRepository.save(registryProject);

        entity.registry_project_id = registryProject.id;

        const queueMessage = buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_LINK,
            {
                id: registryProject.id,
            },
        );

        await publishMessage(queueMessage);
    }

    // -----------------------------------------------------

    await repository.save(entity);

    return res.respond({ data: entity });
}
