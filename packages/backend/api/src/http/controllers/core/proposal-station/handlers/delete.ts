/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function deleteProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.hasPermission(PermissionID.PROPOSAL_DROP)
    ) {
        throw new ForbiddenError('You are not allowed to drop a proposal station.');
    }

    const repository = getRepository(ProposalStationEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.proposal_realm_id)
    ) {
        throw new ForbiddenError('You are not authorized to drop this proposal station.');
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return res.respondDeleted({ data: entity });
}
