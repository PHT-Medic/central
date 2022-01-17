/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { PermissionID } from '@personalhealthtrain/ui-common';
import { ProposalStationEntity } from '../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { runProposalStationValidation } from './utils';

export async function updateProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError('The proposal-station id is not valid.');
    }

    const repository = getRepository(ProposalStationEntity);
    let entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, entity.station_realm_id);
    const isAuthorizedForStation = req.ability.hasPermission(PermissionID.PROPOSAL_APPROVE);

    const isAuthorityOfProposal = isPermittedForResourceRealm(req.realmId, entity.proposal_realm_id);
    if (isAuthorityOfProposal) {
        throw new ForbiddenError('Only permitted target station members can update this object.');
    }

    if (
        !isAuthorityOfStation ||
        !isAuthorizedForStation
    ) {
        throw new ForbiddenError();
    }

    const data = await runProposalStationValidation(req, 'update');

    entity = repository.merge(entity, data);

    entity = await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}
