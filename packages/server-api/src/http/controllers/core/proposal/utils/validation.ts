/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRealmResourceWritable } from '@authup/core';
import { ForbiddenError } from '@ebec/http';
import { check, validationResult } from 'express-validator';
import { ProposalRisk } from '@personalhealthtrain/core';
import type { Request } from 'routup';
import { MasterImageEntity } from '../../../../../domains/master-image/entity';
import type { ProposalEntity } from '../../../../../domains/proposal/entity';
import type { RequestValidationResult } from '../../../../validation';
import {
    RequestValidationError, extendRequestValidationResultWithRelation,
    initRequestValidationResult,
    matchedValidationData,
} from '../../../../validation';
import { useRequestEnv } from '../../../../request';

export async function runProposalValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<RequestValidationResult<ProposalEntity>> {
    const result : RequestValidationResult<ProposalEntity> = initRequestValidationResult();

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
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendRequestValidationResultWithRelation(result, MasterImageEntity, {
        id: 'master_image_id',
        entity: 'master_image',
    });

    // ----------------------------------------------

    if (operation === 'create') {
        const realm = useRequestEnv(req, 'realm');
        if (result.data.realm_id) {
            if (!isRealmResourceWritable(realm, result.data.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this proposal.');
            }
        } else {
            result.data.realm_id = realm.id;
        }
    }

    return result;
}
