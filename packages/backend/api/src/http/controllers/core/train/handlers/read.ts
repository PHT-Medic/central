import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@typescript-auth/server-core';
import { applyFilters, applyPagination, applyQueryRelations } from 'typeorm-extension';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { include } = req.query;
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const repository = getRepository(TrainEntity);
    const query = repository.createQueryBuilder('train')
        .where('train.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId, 'train.realm_id');

    applyQueryRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['user', 'proposal', 'master_image'],
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, include } = req.query;

    const repository = getRepository(TrainEntity);
    const query = repository.createQueryBuilder('train');

    if (filter) {
        let { realm_id: realmId } = filter as Record<string, any>;

        if (!isPermittedForResourceRealm(req.realmId, realmId)) {
            realmId = req.realmId;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filter.realm_id = realmId;
    } else {
        onlyRealmPermittedQueryResources(query, req.realmId, 'train.realm_id');
    }

    applyQueryRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['user', 'proposal', 'master_image'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'train',
        allowed: ['id', 'name', 'proposal_id', 'realm_id'],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    query.orderBy('train.updated_at', 'DESC');

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
