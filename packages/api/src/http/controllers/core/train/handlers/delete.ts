/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isRealmResourceWritable } from '@authup/common';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../../../../../domains/train';
import { ProposalEntity } from '../../../../../domains/proposal/entity';
import { useRequestEnv } from '../../../../request';

export async function deleteTrainRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.TRAIN_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const entity = await repository.findOne({ where: { id }, relations: ['proposal'] });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { proposal } = entity;

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    proposal.trains--;
    const proposalRepository = dataSource.getRepository(ProposalEntity);
    await proposalRepository.save(proposal);

    entity.proposal = proposal;

    return sendAccepted(res, entity);
}
