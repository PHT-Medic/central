/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { ProposalEntity } from '../../../../../domains/core/proposal/entity';

export async function getOneProposalRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal')
        .where('proposal.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
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

    return send(res, entity);
}

export async function getManyProposalRouteHandler(req: Request, res: Response) : Promise<any> {
    const {
        filter,
    } = useRequestQuery(req);

    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProposalEntity);
    const query = repository.createQueryBuilder('proposal');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
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

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
