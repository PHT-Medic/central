/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';

export async function getOneUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('userSecret')
        .where('userSecret.realm_id = :realmId', { realmId: req.realmId })
        .where('userSecret.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.has(PermissionID.USER_EDIT)) {
        query.where('userSecret.user_id = :userId', { userId: req.userId });
    }

    applyQuery(query, req.query, {
        defaultAlias: 'userSecret',
        fields: {
            default: ['id', 'key', 'type', 'content', 'user_id', 'realm_id', 'created_at', 'updated_at'],
        },
        relations: {
            allowed: ['user', 'realm'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('userSecret');

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.has(PermissionID.USER_EDIT) && req.userId) {
        query.where('userSecret.user_id = :userId', { userId: req.userId });
    }

    const { pagination } = applyQuery(query, req.query, {
        defaultAlias: 'userSecret',
        fields: {
            default: ['id', 'key', 'type', 'content', 'user_id', 'realm_id', 'created_at', 'updated_at'],
        },
        filters: {
            allowed: ['id', 'type', 'user_id', 'key'],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['user', 'realm'],
        },
        sort: {
            allowed: ['id', 'created_at', 'updated_at', 'user_id'],
        },
    });

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
