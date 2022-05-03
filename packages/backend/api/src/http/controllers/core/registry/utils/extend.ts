/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';
import { Registry } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
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
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryEntity);
        const entity = await repository.findOneBy({ id: result.data.registry_id });
        if (!entity) {
            throw new BadRequestError(buildExpressValidationErrorMessage('registry_id'));
        }

        result.meta.registry = entity;
    }

    return result;
}
