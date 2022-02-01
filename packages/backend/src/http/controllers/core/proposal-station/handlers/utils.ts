/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isProposalStationApprovalStatus } from '@personalhealthtrain/ui-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError } from '../../../../error/validation';
import { matchedValidationData } from '../../../../../modules/express-validator';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';

export async function runProposalStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<ProposalStationEntity>> {
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

    return matchedValidationData(req, { includeOptionals: true });
}
