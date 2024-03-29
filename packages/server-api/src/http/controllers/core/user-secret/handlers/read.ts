/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/core';
import { UserSecretEntity, onlyRealmWritableQueryResources } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function getOneUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const realm = useRequestEnv(req, 'realm');
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = repository.createQueryBuilder('userSecret')
        .where('userSecret.realm_id = :realmId', { realmId: realm.id })
        .where('userSecret.id = :id', { id });

    onlyRealmWritableQueryResources(query, realm);

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.USER_EDIT)) {
        query.where('userSecret.user_id = :userId', { userId: useRequestEnv(req, 'userId') });
    }

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'userSecret',
        fields: {
            default: ['id', 'key', 'hash', 'type', 'content', 'user_id', 'realm_id', 'created_at', 'updated_at'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('userSecret');

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'));

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.USER_EDIT) && useRequestEnv(req, 'userId')) {
        query.where('userSecret.user_id = :userId', { userId: useRequestEnv(req, 'userId') });
    }

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'userSecret',
        fields: {
            default: ['id', 'key', 'hash', 'type', 'content', 'user_id', 'realm_id', 'created_at', 'updated_at'],
        },
        filters: {
            allowed: ['id', 'key', 'hash', 'type', 'content', 'user_id', 'realm_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['id', 'created_at', 'updated_at', 'user_id'],
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
