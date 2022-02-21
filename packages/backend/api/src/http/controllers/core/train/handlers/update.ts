import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { runTrainValidation } from './utils';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function updateTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    if (!req.ability.hasPermission(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const data = await runTrainValidation(req, 'update');
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(TrainEntity);
    let train = await repository.findOne(id);

    if (typeof train === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError();
    }

    train = repository.merge(train, data);

    const result = await repository.save(train);

    return res.respondAccepted({
        data: result,
    });
}
