/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { Proposal } from '@personalhealthtrain/central-common';
import { ExpressValidationResult } from '../../../../express-validation';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';

type ExpressValidationResultExtendedWithProposal = ExpressValidationResult<{
    [key: string]: any,
    proposal_id: Proposal['id']
}, {
    [key: string]: any,
    proposal?: ProposalEntity
}>;

export async function extendExpressValidationResultWithProposal<
    T extends ExpressValidationResultExtendedWithProposal,
    >(result: T) : Promise<T> {
    if (result.data.proposal_id) {
        const stationRepository = getRepository(ProposalEntity);
        const station = await stationRepository.findOne(result.data.proposal_id);
        if (typeof station === 'undefined') {
            throw new NotFoundError('The referenced proposal is invalid.');
        }

        result.meta.proposal = station;
    }

    return result;
}
