/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { ProposalRisk } from '@personalhealthtrain/central-common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { extendExpressValidationResultWithMasterImage } from '../../master-image/utils/extend';
import { ProposalValidationResult } from '../type';

export async function runProposalValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<ProposalValidationResult> {
    const result : ProposalValidationResult = {
        data: {},
        meta: {},
    };

    const titleChain = check('title')
        .exists()
        .isLength({ min: 5, max: 100 });

    if (operation === 'update') {
        titleChain.optional();
    }

    await titleChain.run(req);

    // ----------------------------------------------

    const requestDataAndRiskCommentChain = check(['requested_data', 'risk_comment'])
        .exists()
        .isLength({ min: 10, max: 2048 });

    if (operation === 'update') {
        requestDataAndRiskCommentChain.optional();
    }

    await requestDataAndRiskCommentChain.run(req);

    // ----------------------------------------------

    const riskChain = check('risk')
        .exists()
        .isString()
        .isIn(Object.values(ProposalRisk));

    if (operation === 'update') {
        riskChain.optional();
    }

    await riskChain.run(req);

    // ----------------------------------------------

    await check('master_image_id')
        .isUUID()
        .notEmpty()
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    await extendExpressValidationResultWithMasterImage(result);

    return result;
}
