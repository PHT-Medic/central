/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProposalStation } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../express-validation';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ProposalEntity } from '../../../../domains/core/proposal/entity';

export type ProposalStationValidationResult = ExpressValidationResult<ProposalStation, {
    proposal?: ProposalEntity,
    station?: StationEntity
}>;
