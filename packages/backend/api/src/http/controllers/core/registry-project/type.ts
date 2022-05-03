/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryProject } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../express-validation';
import { RegistryEntity } from '../../../../domains/core/registry/entity';

export type RegistryProjectValidationResult = ExpressValidationResult<RegistryProject, {
    registry?: RegistryEntity
}>;
