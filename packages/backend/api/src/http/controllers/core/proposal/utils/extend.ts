/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { Proposal } from '@personalhealthtrain/central-common';
import { ExpressValidationResult, buildExpressValidationErrorMessage } from '../../../../express-validation';
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
        const repository = getRepository(ProposalEntity);
        const entity = await repository.findOne(result.data.proposal_id);
        if (typeof entity === 'undefined') {
            throw new BadRequestError(buildExpressValidationErrorMessage('proposal_id'));
        }

        result.meta.proposal = entity;
    }

    return result;
}
