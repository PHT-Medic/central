/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFields, applyFilters, applyPagination, applyRelations, applySort, useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@typescript-error/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';

export async function getOneUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('entity')
        .where('entity.realm_id = :realmId', { realmId: req.realmId })
        .where('entity.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        query.where('entity.user_id = :userId', { userId: req.userId });
    }

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        include, fields, filter, page, sort,
    } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('entity');

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.hasPermission(PermissionID.USER_EDIT) && req.userId) {
        query.where('entity.user_id = :userId', { userId: req.userId });
    }

    applyFields(query, fields, {
        defaultAlias: 'entity',
        allowed: ['id', 'type', 'content', 'user_id', 'created_at', 'updated_at'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'entity',
        allowed: ['id', 'type', 'user_id', 'key'],
    });

    applyRelations(query, include, {
        defaultAlias: 'entity',
        allowed: ['user', 'realm'],
    });

    applySort(query, sort, {
        defaultAlias: 'entity',
        allowed: ['id', 'created_at', 'updated_at', 'user_id'],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    console.log(query.getSql());

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
