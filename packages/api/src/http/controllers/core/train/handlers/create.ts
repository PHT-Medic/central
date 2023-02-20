/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runTrainValidation } from '../utils';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { TrainEntity } from '../../../../../domains/core/train';

export async function createTrainRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.TRAIN_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runTrainValidation(req, 'create');

    if (
        !result.data.master_image_id &&
        result.relation.proposal
    ) {
        result.data.master_image_id = result.relation.proposal.master_image_id;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository<Train>(TrainEntity);

    const realm = useRequestEnv(req, 'realm');

    const entity = repository.create({
        realm_id: realm.id,
        user_id: useRequestEnv(req, 'userId'),
        ...result.data,
    });

    await repository.save(entity);

    result.relation.proposal.trains++;
    const proposalRepository = dataSource.getRepository(ProposalEntity);
    await proposalRepository.save(result.relation.proposal);

    return sendCreated(res, entity);
}
