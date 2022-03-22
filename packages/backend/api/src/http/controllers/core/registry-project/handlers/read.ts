import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFields,
    applyFilters, applyPagination, applyRelations, applySort,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

export async function getOneRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

    const repository = getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject')
        .where('registryProject.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['realm', 'registry'],
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

export async function getManyRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const repository = getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject');

    onlyRealmPermittedQueryResources(query, req.realmId, 'registryProject.realm_id');

    applyFields(query, fields, {
        defaultAlias: 'registryProject',
        allowed: ['id', 'name', 'address', 'ecosystem', 'created_at', 'updated_at'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'registryProject',
        allowed: ['id', 'ecosystem', 'name'],
    });

    applySort(query, sort, {
        defaultAlias: 'registryProject',
        allowed: ['id', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['realm', 'registry'],
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
