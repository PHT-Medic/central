/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function deleteProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.has(PermissionID.PROPOSAL_EDIT) &&
        !req.ability.has(PermissionID.PROPOSAL_DROP)
    ) {
        throw new ForbiddenError('You are not allowed to drop a proposal station.');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
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
