/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runProposalStationValidation } from './utils';

export async function updateProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
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

    const result = await runProposalStationValidation(req, 'update');

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}
