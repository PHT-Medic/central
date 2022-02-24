/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { runProposalValidation } from './utils';

export async function createProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.PROPOSAL_ADD)) {
        throw new ForbiddenError();
    }

    const data : Partial<ProposalEntity> = await runProposalValidation(req, 'create');

    const repository = getRepository(ProposalEntity);
    const entity = repository.create({
        realm_id: req.realmId,
        user_id: req.user.id,
        ...data,
    });
    await repository.save(entity);

    return res.respond({ data: entity });
}