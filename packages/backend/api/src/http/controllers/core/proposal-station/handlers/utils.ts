/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { extendExpressValidationResultWithStation } from '../../station/utils/extend';
import { ProposalStationValidationResult } from '../type';
import { extendExpressValidationResultWithProposal } from '../../proposal/utils/extend';

export async function runProposalStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<ProposalStationValidationResult> {
    const result : ProposalStationValidationResult = {
        data: {},
        meta: {},
    };

    if (operation === 'create') {
        await check('proposal_id')
            .exists()
            .isUUID()
            .run(req);

        await check('station_id')
            .exists()
            .isUUID()
            .run(req);
    }

    if (operation === 'update') {
        await check('approval_status')
            .optional()
            .custom((command) => isProposalStationApprovalStatus(command))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .isLength({ min: 3, max: 4096 })
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithProposal(result);
    if (result.meta.proposal) {
        result.data.proposal_realm_id = result.meta.proposal.realm_id;

        if (!isPermittedForResourceRealm(req.realmId, result.meta.proposal.realm_id)) {
            throw new NotFoundError('The referenced proposal realm is not permitted.');
        }
    }

    await extendExpressValidationResultWithStation(result);
    if (result.meta.station) {
        result.data.station_realm_id = result.meta.station.realm_id;
    }

    return result;
}
