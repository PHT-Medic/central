/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import {
    PermissionID,
    SecretType,
    USER_SECRET_ENGINE_KEY,
    UserSecret, UserSecretEngineSecretPayload, VaultAPI, buildSecretStorageUserKey,
} from '@personalhealthtrain/ui-common';
import { BadRequestError } from '@typescript-error/http';
import { UserEntity } from '@typescript-auth/server';
import { useTrapiClient } from '@trapi/client';
import { ExpressRequest } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';
import { matchedValidationData } from '../../../../modules/express-validator';
import env from '../../../../env';
import { ApiKey } from '../../../../config/api';

export async function runUserSecretValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<UserSecret>> {
    if (
        env.userSecretsImmutable &&
        !req.ability.hasPermission(PermissionID.USER_EDIT)
    ) {
        throw new BadRequestError('User secrets are immutable and can not be changed in this environment.');
    }

    const contentChain = check('content')
        .isLength({ min: 3, max: 8192 });

    if (operation === 'update') {
        contentChain.optional();
    }

    await contentChain.run(req);

    // ----------------------------------------------

    const typeChain = check('type')
        .optional({ nullable: true })
        .isIn(Object.values(SecretType));

    if (operation === 'update') {
        typeChain.optional();
    }

    await typeChain.run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}

export async function extendUserSecretEnginePayload(
    id: typeof UserEntity.prototype.id,
    key: string,
    value: string,
) {
    const keyPath = buildSecretStorageUserKey(id);

    const payload : UserSecretEngineSecretPayload = {
        data: {},
        options: {
            cas: 1,
        },
    };

    try {
        const { data: responseData } = await useTrapiClient(ApiKey.VAULT)
            .get(keyPath);
        payload.data = responseData.data.data;
    } catch (e) {
        // ...
    }

    payload.data[key] = value;

    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(USER_SECRET_ENGINE_KEY, id.toString(), payload);
}
