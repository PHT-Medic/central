/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { ProposalRisk } from '@personalhealthtrain/ui-common';
import { ExpressRequest } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';
import { matchedValidationData } from '../../../../modules/express-validator';
import { MasterImageEntity } from '../../../../domains/core/master-image/entity';
import { ProposalEntity } from '../../../../domains/core/proposal/entity';

export async function runProposalValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<ProposalEntity>> {
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
        .exists()
        .isUUID()
        .custom((value) => getRepository(MasterImageEntity).findOne(value).then((masterImageResult) => {
            if (typeof masterImageResult === 'undefined') throw new Error('The referenced master image does not exist.');
        }))
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
