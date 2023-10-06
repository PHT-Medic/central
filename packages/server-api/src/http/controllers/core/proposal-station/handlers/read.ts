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
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/core';
import { ProposalStationEntity, onlyRealmWritableQueryResources } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function getOneProposalStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const { include } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProposalStationEntity);
    const query = repository.createQueryBuilder('proposalStation')
        .where('proposalStation.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['station', 'proposal'],
        defaultAlias: 'proposalStation',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.station_realm_id) &&
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.proposal_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyProposalStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProposalStationEntity);
    const query = await repository.createQueryBuilder('proposalStation');
    query.distinctOn(['proposalStation.id']);

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'), [
        'proposalStation.station_realm_id',
        'proposalStation.proposal_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'proposalStation',
        filters: {
            allowed: [
                'proposal_realm_id',
                'proposal_id',
                'proposal.id',
                'proposal.title',

                'station_realm_id',
                'station_id',
                'station.name',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['station', 'proposal'],
        },
        sort: {
            allowed: ['created_at', 'updated_at'],
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
