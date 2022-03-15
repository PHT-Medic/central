/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainStation } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../express-validation';
import { TrainEntity } from '../../../../domains/core/train/entity';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ProposalStationEntity } from '../../../../domains/core/proposal-station/entity';

export type TrainStationValidationResult = ExpressValidationResult<TrainStation, {
    train?: TrainEntity,
    station?: StationEntity,
    proposalStation?: ProposalStationEntity
}>;
