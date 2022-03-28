/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Proposal } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../express-validation';
import { MasterImageEntity } from '../../../../domains/core/master-image/entity';

export type ProposalValidationResult = ExpressValidationResult<Proposal, {
    masterImage?: MasterImageEntity
}>;
