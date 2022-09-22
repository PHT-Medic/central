/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isPermittedForResourceRealm } from '@authelion/common';
import fs from 'fs';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { getTrainFilesDirectoryPath } from '../../../../../domains/core/train-file/path';

export async function deleteTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.has(PermissionID.TRAIN_DROP)) {
        throw new ForbiddenError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const entity = await repository.findOne({ where: { id }, relations: ['proposal'] });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
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

    try {
        await fs.promises.access(getTrainFilesDirectoryPath(entity.id), fs.constants.R_OK | fs.constants.W_OK);
        await fs.promises.unlink(getTrainFilesDirectoryPath(entity.id));
    } catch (e) {
        // do nothing ;), we tried hard :P
    }

    // todo: delete train result :/ maybe message queue

    return res.respondDeleted({ data: entity });
}
