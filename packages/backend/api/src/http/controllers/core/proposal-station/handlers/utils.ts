/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isProposalStationApprovalStatus } from '@personalhealthtrain/ui-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { createRequestProposalIdValidation } from '../../proposal/utils';
import { createRequestStationIdValidation } from '../../station/utils';

export async function runProposalStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<ProposalStationEntity>> {
    if (operation === 'create') {
        await createRequestProposalIdValidation()
            .run(req);

        await createRequestStationIdValidation({ permittedForRealm: false })
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

    return matchedValidationData(req, { includeOptionals: true });
}
