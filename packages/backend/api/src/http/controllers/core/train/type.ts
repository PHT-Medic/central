/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../express-validation';
import { ProposalEntity } from '../../../../domains/core/proposal/entity';
import { MasterImageEntity } from '../../../../domains/core/master-image/entity';

export type TrainValidationResult = ExpressValidationResult<Train, {
    proposal?: ProposalEntity,
    masterImage?: MasterImageEntity
}>;
