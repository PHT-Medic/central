/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, Train } from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { runTrainValidation } from './utils';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { TrainEntity } from '../../../../../domains/core/train/entity';

export async function createTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.TRAIN_ADD)) {
        throw new ForbiddenError();
    }

    const validationData : Partial<Train> = await runTrainValidation(req, 'create');

    // proposal
    const proposalRepository = getRepository(ProposalEntity);
    const proposal = await proposalRepository.findOne(validationData.proposal_id);
    if (typeof proposal === 'undefined') {
        throw new BadRequestError('The referenced proposal does not exist.');
    }

    if (proposal.realm_id !== req.realmId) {
        throw new Error('You are not permitted to create a train for that realm.');
    }

    if (!validationData.master_image_id) {
        validationData.master_image_id = proposal.master_image_id;
    }

    const repository = getRepository<Train>(TrainEntity);

    const entity = repository.create({
        realm_id: req.realmId,
        user_id: req.user.id,
        ...validationData,
    });

    await repository.save(entity);

    proposal.trains++;
    await proposalRepository.save(proposal);

    return res.respond({ data: entity });
}
