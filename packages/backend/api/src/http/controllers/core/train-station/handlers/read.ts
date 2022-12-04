/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery, applyRelations, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { useRequestEnv } from '../../../../request';

export async function getOneTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    const query = repository.createQueryBuilder('trainStation')
        .where('trainStation.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['station', 'train'],
        defaultAlias: 'trainStation',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.train_realm_id) &&
        !isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.station_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    const query = await repository.createQueryBuilder('trainStation');
    query.distinctOn(['trainStation.id']);

    onlyRealmPermittedQueryResources(query, useRequestEnv(req, 'realmId'), [
        'trainStation.train_realm_id',
        'trainStation.station_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
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

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
