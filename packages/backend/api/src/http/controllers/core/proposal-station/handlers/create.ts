/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@ebec/http';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { runProposalStationValidation } from '../utils/validation';
import env from '../../../../../env';

export async function createProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        !req.ability.has(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.has(PermissionID.PROPOSAL_ADD)
    ) {
        throw new ForbiddenError('You are not allowed to add a proposal station.');
    }

    const result = await runProposalStationValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);
    let entity = repository.create(result.data);

    if (env.skipProposalApprovalOperation) {
        entity.approval_status = ProposalStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}
