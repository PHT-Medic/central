/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isPropertySet } from '@authup/common';
import {
    PermissionID, RegistryProjectType, createNanoID,
    isHex,
} from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import { validationResult } from 'express-validator';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RequestValidationError } from '../../../../validation';
import { useRequestEnv } from '../../../../request';
import { runStationValidation } from '../utils';
import { StationEntity } from '../../../../../domains/core/station';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';
import { RegistryQueueCommand, buildRegistryQueueMessage } from '../../../../../domains/special/registry';

export async function createStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.STATION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    const result = await runStationValidation(req, 'create');

    if (
        isPropertySet(result.data, 'public_key') &&
        !isHex(result.data.public_key)
    ) {
        result.data.public_key = Buffer.from(result.data.public_key, 'utf8').toString('hex');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(StationEntity);

    const entity = repository.create(result.data);

    // -----------------------------------------------------

    if (
        result.relation.registry &&
        !entity.ecosystem
    ) {
        entity.ecosystem = result.relation.registry.ecosystem;
    }

    if (entity.registry_id) {
        if (entity.ecosystem !== result.relation.registry.ecosystem) {
            throw new BadRequestError('The ecosystem of the station and the registry must be the same.');
        }

        const registryProjectExternalName = entity.external_name || createNanoID();
        entity.external_name = registryProjectExternalName;

        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
        const registryProject = registryProjectRepository.create({
            external_name: registryProjectExternalName,
            name: entity.name,
            ecosystem: entity.ecosystem,
            type: RegistryProjectType.STATION,
            realm_id: entity.realm_id,
            registry_id: entity.registry_id,
            public: false,
        });

        await registryProjectRepository.save(registryProject);

        entity.registry_project_id = registryProject.id;

        await publish(buildRegistryQueueMessage(
            RegistryQueueCommand.PROJECT_LINK,
            {
                id: registryProject.id,
            },
        ));
    }

    // -----------------------------------------------------

    await repository.save(entity);

    return sendCreated(res, entity);
}
