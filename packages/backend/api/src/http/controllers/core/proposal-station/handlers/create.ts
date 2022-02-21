/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, ProposalStationApprovalStatus } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { runProposalStationValidation } from './utils';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { StationEntity } from '../../../../../domains/core/station/entity';
import env from '../../../../../env';

export async function createProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        !req.ability.hasPermission(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.hasPermission(PermissionID.PROPOSAL_ADD)
    ) {
        throw new ForbiddenError('You are not allowed to add a proposal station.');
    }

    const data : Partial<ProposalStationEntity> = await runProposalStationValidation(req, 'create');

    // proposal
    const proposalRepository = getRepository(ProposalEntity);
    const proposal = await proposalRepository.findOne(data.proposal_id);

    if (typeof proposal === 'undefined') {
        throw new NotFoundError('The referenced proposal was not found.');
    }

    data.proposal_realm_id = proposal.realm_id;

    if (!isPermittedForResourceRealm(req.realmId, proposal.realm_id)) {
        throw new ForbiddenError();
    }

    // station
    const stationRepository = getRepository(StationEntity);
    const station = await stationRepository.findOne(data.station_id);

    if (typeof station === 'undefined') {
        throw new NotFoundError('The referenced station was not found.');
    }

    data.station_realm_id = station.realm_id;

    const repository = getRepository(ProposalStationEntity);
    let entity = repository.create(data);

    if (env.skipProposalApprovalOperation) {
        entity.approval_status = ProposalStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}
