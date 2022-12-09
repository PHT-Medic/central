/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmReadableQueryResources } from '@authup/server-database';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { UserSecretEntity } from '../../../../../domains/core/user-secret/entity';
import { useRequestEnv } from '../../../../request';

export async function getOneUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('userSecret')
        .where('userSecret.realm_id = :realmId', { realmId: useRequestEnv(req, 'realmId') })
        .where('userSecret.id = :id', { id });

    onlyRealmReadableQueryResources(query, useRequestEnv(req, 'realmId'));

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.USER_EDIT)) {
        query.where('userSecret.user_id = :userId', { userId: useRequestEnv(req, 'userId') });
    }

    applyQuery(query, useRequestQuery(req), {
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

    return send(res, entity);
}

export async function getManyUserSecretRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserSecretEntity);
    const query = await repository.createQueryBuilder('userSecret');

    onlyRealmReadableQueryResources(query, useRequestEnv(req, 'realmId'));

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.USER_EDIT) && useRequestEnv(req, 'userId')) {
        query.where('userSecret.user_id = :userId', { userId: useRequestEnv(req, 'userId') });
    }

    const { pagination } = applyQuery(query, useRequestQuery(req), {
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

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
