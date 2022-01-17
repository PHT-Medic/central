/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
    STATION_SECRET_ENGINE_KEY,
    VaultAPI,
    buildSecretStorageStationPayload,
    isHex,
} from '@personalhealthtrain/ui-common';
import { ForbiddenError } from '@typescript-error/http';
import { validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { useTrapiClient } from '@trapi/client';
import { ExpressValidationError } from '../../../../config/http/error/validation';
import { runStationValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ApiKey } from '../../../../config/api';

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

    await repository.save(entity);

    if (entity.public_key) {
        const payload = buildSecretStorageStationPayload(entity.public_key);
        await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(STATION_SECRET_ENGINE_KEY, entity.secure_id, payload);
    }

    return res.respond({ data: entity });
}
