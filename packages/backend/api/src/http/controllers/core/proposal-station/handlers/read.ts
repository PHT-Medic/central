/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import {
    applyQuery,
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

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
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.proposal_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProposalStationEntity);
    const query = await repository.createQueryBuilder('proposalStation');
    query.distinctOn(['proposalStation.id']);

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'proposalStation.station_realm_id',
        'proposalStation.proposal_realm_id',
    ]);

    const { pagination } = applyQuery(query, req.query, {
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
