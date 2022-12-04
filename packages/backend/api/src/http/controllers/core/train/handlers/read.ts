/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery,
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { isPermittedForResourceRealm } from '@authelion/common';
import { TrainEntity } from '../../../../../domains/core/train';
import { useRequestEnv } from '../../../../request';

export async function getOneTrainRouteHandler(req: Request, res: Response) : Promise<any> {
    const { include } = useRequestQuery(req);
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const query = repository.createQueryBuilder('train')
        .where('train.id = :id', { id });

    onlyRealmPermittedQueryResources(query, useRequestEnv(req, 'realmId'), 'train.realm_id');

    applyRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['user', 'proposal', 'master_image', 'entrypoint_file'],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyTrainRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const query = repository.createQueryBuilder('train');

    const { pagination, filters } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'train',
        filters: {
            allowed: ['id', 'name', 'proposal_id', 'realm_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['user', 'proposal', 'master_image', 'entrypoint_file'],
        },
        sort: {
            allowed: ['created_at', 'updated_at'],
            default: {
                updated_at: 'DESC',
            },
        },
    });

    let filterRealmId: string | undefined;

    if (filters) {
        for (let i = 0; i < filters.length; i++) {
            if (
                filters[i].path === 'train' &&
                filters[i].key === 'realm_id'
            ) {
                filterRealmId = filters[i].value as string;
                break;
            }
        }
    }

    if (filterRealmId) {
        if (!isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), filterRealmId)) {
            throw new ForbiddenError('You are not permitted to inspect trains for the given realm.');
        }
    } else {
        onlyRealmPermittedQueryResources(query, useRequestEnv(req, 'realmId'), 'train.realm_id');
    }

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
