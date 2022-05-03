/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFields,
    applyFilters, applyPagination, applyRelations, applySort, useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal')
        .where('proposal.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'proposal',
        allowed: ['master_image', 'realm', 'user'],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    // todo: permit resource to realm/station owner XAND receiving realm/station OR to all
    /*
    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }
     */

    return res.respond({ data: entity });
}

export async function getManyProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal');

    if (filter) {
        let { realm_id: realmId } = filter as Record<string, any>;

        if (!isPermittedForResourceRealm(req.realmId, realmId)) {
            realmId = req.realmId;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filter.realm_id = realmId;
    } else {
        onlyRealmPermittedQueryResources(query, req.realmId, 'proposal.realm_id');
    }

    applyFields(query, fields, {
        defaultAlias: 'proposal',
        allowed: ['id', 'title'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'proposal',
        allowed: ['id', 'title', 'realm_id', 'user_id'],
    });

    applySort(query, sort, {
        defaultAlias: 'proposal',
        allowed: ['id', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'proposal',
        allowed: ['user', 'realm', 'master_image'],
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
