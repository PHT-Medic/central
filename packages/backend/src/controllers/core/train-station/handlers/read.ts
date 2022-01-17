import { getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@typescript-auth/server';
import { applyFilters, applyPagination, applyRelations } from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { TrainStationEntity } from '../../../../domains/core/train-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';

export async function getOneTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id, include } = req.params;

    const repository = getRepository(TrainStationEntity);
    const query = repository.createQueryBuilder('trainStation')
        .where('trainStation.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train_realm_id) &&
        !isPermittedForResourceRealm(req.realmId, entity.station_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, include } = req.query;

    const repository = getRepository(TrainStationEntity);
    const query = await repository.createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.train', 'train')
        .leftJoinAndSelect('trainStation.station', 'station');

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'trainStation.train_realm_id',
        'trainStation.station_realm_id',
    ]);

    const relations = applyRelations(query, include, {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    applyFilters(query, filter, {
        relations,
        defaultAlias: 'trainStation',
        allowed: [
            'train_id',
            'train.id',

            'station_id',
            'station.name',
            'station.realm_id',
        ],
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
