/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import fs from 'fs';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { getTrainFilesDirectoryPath } from '../../../../../config/pht/train-file/path';

export async function deleteTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    if (!req.ability.hasPermission(PermissionID.TRAIN_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainEntity);

    const entity = await repository.findOne(id, { relations: ['proposal'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    const { proposal } = entity;

    await repository.remove(entity);

    proposal.trains--;
    const proposalRepository = getRepository(ProposalEntity);
    await proposalRepository.save(proposal);

    try {
        await fs.promises.access(getTrainFilesDirectoryPath(entity.id), fs.constants.R_OK | fs.constants.W_OK);
        await fs.promises.unlink(getTrainFilesDirectoryPath(entity.id));
    } catch (e) {
        // do nothing ;), we tried hard :P
    }

    // todo: delete train result :/ maybe message queue

    return res.respondDeleted({ data: entity });
}
