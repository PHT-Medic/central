/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import {
    applyQuery, applyRelations, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id, include } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    const query = repository.createQueryBuilder('trainStation')
        .where('trainStation.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    const entity = await query.getOne();

    if (!entity) {
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
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    const query = await repository.createQueryBuilder('trainStation');
    query.distinctOn(['trainStation.id']);

    onlyRealmPermittedQueryResources(query, req.realmId, [
        'trainStation.train_realm_id',
        'trainStation.station_realm_id',
    ]);

    const { pagination } = applyQuery(query, req.query, {
        defaultAlias: 'trainStation',
        filters: {
            allowed: [
                'run_status',
                'approval_status',

                'train_id',
                'train_realm_id',
                'train.id',
                'train.name',

                'station_id',
                'station_realm_id',
                'station.name',
                'station.realm_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['station', 'train'],
        },
        sort: {
            allowed: ['created_at', 'updated_at', 'index'],
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
