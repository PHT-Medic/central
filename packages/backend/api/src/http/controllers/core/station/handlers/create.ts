/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem, PermissionID, RegistryProjectType, createNanoID, isHex,
} from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@typescript-error/http';
import { validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { ExpressValidationError } from '../../../../express-validation';
import { runStationValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

export async function createStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.STATION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = await runStationValidation(req, 'create');

    if (
        data.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
    }

    const repository = getRepository(StationEntity);

    const entity = repository.create(data);

    // -----------------------------------------------------

    if (entity.ecosystem === Ecosystem.DEFAULT) {
        const registryProjectExternalName = entity.external_id || createNanoID();
        const registryProjectRepository = getRepository(RegistryProjectEntity);
        const registryProject = registryProjectRepository.create({
            external_name: registryProjectExternalName,
            name: entity.name,
            ecosystem: entity.ecosystem,
            type: RegistryProjectType.STATION,
        });

        // todo: maybe
    }

    // -----------------------------------------------------

    await repository.save(entity);

    // todo: create registry project for ecoystem & registry
    // todo: create setup registry project queue message

    return res.respond({ data: entity });
}
