/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { useRequestEnv } from '../../../../request';
import { runProposalStationValidation } from '../utils';
import { useEnv } from '../../../../../config/env';

export async function createProposalStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');

    if (
        !ability.has(PermissionID.PROPOSAL_EDIT) &&
        !ability.has(PermissionID.PROPOSAL_ADD)
    ) {
        throw new ForbiddenError('You are not allowed to add a proposal station.');
    }

    const result = await runProposalStationValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);
    let entity = repository.create(result.data);

    if (useEnv('skipProposalApprovalOperation')) {
        entity.approval_status = ProposalStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
