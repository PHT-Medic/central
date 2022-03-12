/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function deleteProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(ProposalEntity);
    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (entity.trains > 0) {
        throw new BadRequestError('Remove all trains associated to the proposal before removing it.');
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return res.respondDeleted({ data: entity });
}
