/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import {
    applyFilters, applyPagination, applyRelations, useDataSource,
} from 'typeorm-extension';
import { isPermittedForResourceRealm } from '@authelion/common';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { include } = req.query;
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const query = repository.createQueryBuilder('train')
        .where('train.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId, 'train.realm_id');

    applyRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['user', 'proposal', 'master_image', 'entrypoint_file'],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, include } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
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

    applyRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['user', 'proposal', 'master_image', 'entrypoint_file'],
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
