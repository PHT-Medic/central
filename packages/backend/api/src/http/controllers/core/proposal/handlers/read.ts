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
import { isPermittedForResourceRealm } from '@authelion/common';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal')
        .where('proposal.id = :id', { id });

    applyQuery(query, req.query, {
        defaultAlias: 'proposal',
        fields: {
            default: [
                'id',
                'title',
                'requested_data',
                'risk',
                'risk_comment',
                'trains',
                'created_at',
                'updated_at',
                'realm_id',
                'user_id',
                'master_image_id',
            ],
        },
        relations: {
            allowed: ['user', 'realm', 'master_image'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter,
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

    const { pagination } = applyQuery(query, req.query, {
        defaultAlias: 'proposal',
        fields: {
            default: [
                'id',
                'title',
                'requested_data',
                'risk',
                'risk_comment',
                'trains',
                'created_at',
                'updated_at',
                'realm_id',
                'user_id',
                'master_image_id',
            ],
        },
        filters: {
            allowed: ['id', 'title', 'realm_id', 'user_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['user', 'realm', 'master_image'],
        },
        sort: {
            allowed: ['id', 'updated_at', 'created_at'],
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
