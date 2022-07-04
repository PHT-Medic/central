/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';
import { RegistryProject } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { ExpressValidationResult, buildExpressValidationErrorMessage } from '../../../../express-validation';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

type ExpressValidationResultExtendedWithRegistryProject = ExpressValidationResult<{
    [key: string]: any,
    project_id: RegistryProject['id']
}, {
    [key: string]: any,
    project?: RegistryProject
}>;

export async function extendExpressValidationResultWithRegistryProject<
    T extends ExpressValidationResultExtendedWithRegistryProject,
    >(result: T) : Promise<T> {
    if (result.data.project_id) {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryProjectEntity);
        const entity = await repository.findOneBy({ id: result.data.project_id });
        if (!entity) {
            throw new BadRequestError(buildExpressValidationErrorMessage('project_id'));
        }

        result.meta.project = entity;
    }

    return result;
}
