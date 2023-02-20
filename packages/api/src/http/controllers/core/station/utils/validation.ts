/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem } from '@personalhealthtrain/central-common';
import { check, validationResult } from 'express-validator';
import { RealmEntity } from '@authup/server-database';
import { isRealmResourceWritable } from '@authup/common';
import { ForbiddenError } from '@ebec/http';
import type { Request } from 'routup';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';
import type { StationEntity } from '../../../../../domains/core/station/entity';
import { useRequestEnv } from '../../../../request';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError,
    extendRequestValidationResultWithRelation, initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';

export async function runStationValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<RequestValidationResult<StationEntity>> {
    const result : RequestValidationResult<StationEntity> = initRequestValidationResult();

    const nameChain = check('name')
        .isLength({ min: 3, max: 128 })
        .exists()
        .notEmpty();

    if (operation === 'update') {
        nameChain.optional();
    }

    await nameChain.run(req);

    // -------------------------------------------------------------

    await check('public_key')
        .isLength({ min: 5, max: 4096 })
        .exists()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('email')
        .isLength({ min: 5, max: 256 })
        .exists()
        .isEmail()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('hidden')
        .isBoolean()
        .optional()
        .run(req);

    // -------------------------------------------------------------

    await check('external_name')
        .isLength({ min: 1, max: 64 })
        .exists()
        .matches(/^[a-z0-9-_]*$/)
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    await check('registry_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // -------------------------------------------------------------

    if (operation === 'create') {
        await check('realm_id')
            .exists()
            .isUUID()
            .optional({ nullable: true })
            .run(req);

        await check('ecosystem')
            .exists()
            .isIn(Object.values(Ecosystem))
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendRequestValidationResultWithRelation(result, RealmEntity, {
        id: 'realm_id',
        entity: 'realm',
    });

    await extendRequestValidationResultWithRelation(result, RegistryEntity, {
        id: 'registry_id',
        entity: 'registry',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestEnv(req, 'realm');
        if (result.data.realm_id) {
            if (!isRealmResourceWritable(realm, result.data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this station.');
            }
        } else {
            result.data.realm_id = realm.id;
        }
    }

    return result;
}
