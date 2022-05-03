/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runProposalValidation } from './utils';

export async function updateProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runProposalValidation(req, 'update');
    if (!result.data) {
        return res.respondAccepted();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
