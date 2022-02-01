import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@typescript-auth/server';
import { applyFilters, applyPagination, applyRelations } from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneProposalStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include } = req.query;

    const repository = getRepository(ProposalStationEntity);
    const query = repository.createQueryBuilder('proposalStation')
        .where('proposalStation.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['station', 'proposal'],
        defaultAlias: 'proposalStation',
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
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
    const { filter, page, include } = req.query;

    const repository = getRepository(ProposalStationEntity);
    const query = await repository.createQueryBuilder('proposalStation');

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'proposalStation.station_realm_id',
        'proposalStation.proposal_realm_id',
    ]);

    const relations = applyRelations(query, include, {
        allowed: ['station', 'proposal'],
        defaultAlias: 'proposalStation',
    });

    applyFilters(query, filter, {
        relations,
        allowed: [
            'proposal_id',
            'proposal.id',
            'proposal.title',

            'station_id',
            'station.name',
            'station.realm_id',
        ],
        defaultAlias: 'proposalStation',
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
