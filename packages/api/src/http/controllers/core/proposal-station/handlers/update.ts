/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/common';
import { PermissionID } from '@personalhealthtrain/central-common';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { useRequestEnv } from '../../../../request';
import { runProposalStationValidation } from '../utils';

export async function updateProposalStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const ability = useRequestEnv(req, 'ability');

    const isAuthorityOfStation = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.station_realm_id);
    const isAuthorizedForStation = ability.has(PermissionID.PROPOSAL_APPROVE);

    const isAuthorityOfProposal = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.proposal_realm_id);
    if (isAuthorityOfProposal && !isAuthorityOfStation) {
        throw new ForbiddenError('Only permitted target station members can update this object.');
    }

    if (
        !isAuthorityOfStation ||
        !isAuthorizedForStation
    ) {
        throw new ForbiddenError('You are not permitted to update this object.');
    }

    const result = await runProposalStationValidation(req, 'update');

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
