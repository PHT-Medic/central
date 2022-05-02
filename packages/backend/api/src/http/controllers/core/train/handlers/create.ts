/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, Train } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { runTrainValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { TrainEntity } from '../../../../../domains/core/train/entity';

export async function createTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.TRAIN_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runTrainValidation(req, 'create');

    if (
        !result.data.master_image_id &&
        result.meta.proposal
    ) {
        result.data.master_image_id = result.meta.proposal.master_image_id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    const entity = repository.create({
        realm_id: req.realmId,
        user_id: req.user.id,
        ...result.data,
    });

    await repository.save(entity);

    result.meta.proposal.trains++;
    const proposalRepository = dataSource.getRepository(ProposalEntity);
    await proposalRepository.save(result.meta.proposal);

    entity.proposal = result.meta.proposal;

    return res.respond({ data: entity });
}
