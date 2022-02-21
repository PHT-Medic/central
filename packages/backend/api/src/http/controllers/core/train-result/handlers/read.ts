import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@typescript-auth/server';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { TrainResultEntity } from '../../../../../domains/core/train-result/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainResultRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);
    const entity = await repository.findOne(id, { relations: ['train'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainResultRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);
    const query = await repository.createQueryBuilder('trainResult')
        .leftJoinAndSelect('trainResult.train', 'train');

    onlyRealmPermittedQueryResources(query, req.realmId, ['train.realm_id']);

    applyFilters(query, filter, {
        defaultAlias: 'trainResult',
        allowed: ['train_id', 'user_id'],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}
