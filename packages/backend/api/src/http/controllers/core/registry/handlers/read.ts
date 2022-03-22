import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFields,
    applyFilters, applyPagination, applyRelations, applySort,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

export async function getOneRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

    const repository = getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry')
        .where('registry.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'registry',
        allowed: ['realm'],
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

export async function getManyRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const repository = getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry');

    onlyRealmPermittedQueryResources(query, req.realmId, 'registry.realm_id');

    applyFields(query, fields, {
        defaultAlias: 'registry',
        allowed: ['id', 'name', 'address', 'ecosystem', 'created_at', 'updated_at'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'registry',
        allowed: ['id', 'ecosystem', 'name'],
    });

    applySort(query, sort, {
        defaultAlias: 'registry',
        allowed: ['id', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'registry',
        allowed: ['realm'],
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
