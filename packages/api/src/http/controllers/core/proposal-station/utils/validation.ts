/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/common';
import { Request } from 'routup';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { StationEntity } from '../../../../../domains/core/station';
import { useRequestEnv } from '../../../../request';
import {
    ExpressValidationError,
    ExpressValidationResult, extendExpressValidationResultWithRelation,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../../express-validation';

export async function runProposalStationValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<ExpressValidationResult<ProposalStationEntity>> {
    const result : ExpressValidationResult<ProposalStationEntity> = initExpressValidationResult();

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
            .isIn(Object.values(ProposalStationApprovalStatus))
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

    await extendExpressValidationResultWithRelation(result, ProposalEntity, {
        id: 'proposal_id',
        entity: 'proposal',
    });

    if (result.relation.proposal) {
        result.data.proposal_realm_id = result.relation.proposal.realm_id;

        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.proposal.realm_id)) {
            throw new NotFoundError('The referenced proposal realm is not permitted.');
        }
    }

    await extendExpressValidationResultWithRelation(result, StationEntity, {
        id: 'station_id',
        entity: 'station',
    });
    if (result.relation.station) {
        result.data.station_realm_id = result.relation.station.realm_id;
    }

    return result;
}
