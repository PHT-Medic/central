/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { BadRequestError } from '@typescript-error/http';
import { Registry } from '@personalhealthtrain/central-common';
import { ExpressValidationResult, buildExpressValidationErrorMessage } from '../../../../express-validation';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

type ExpressValidationResultExtendedWithRegistry = ExpressValidationResult<{
    [key: string]: any,
    registry_id: Registry['id']
}, {
    [key: string]: any,
    registry?: RegistryEntity
}>;

export async function extendExpressValidationResultWithRegistry<
    T extends ExpressValidationResultExtendedWithRegistry,
    >(result: T) : Promise<T> {
    if (result.data.registry_id) {
        const repository = getRepository(RegistryEntity);
        const entity = await repository.findOne(result.data.registry_id);
        if (typeof entity === 'undefined') {
            throw new BadRequestError(buildExpressValidationErrorMessage('registry_id'));
        }

        result.meta.registry = entity;
    }

    return result;
}
