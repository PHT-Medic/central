/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery,
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { TrainLogEntity } from '../../../../../domains/core/train-log';

export async function getOneTrainLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainLogEntity);
    const query = repository.createQueryBuilder('trainLog')
        .where('trainLog.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['train'],
        defaultAlias: 'trainLog',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyTrainLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainLogEntity);
    const query = await repository.createQueryBuilder('trainLog');
    query.distinctOn(['trainLog.id']);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'trainLog',
        filters: {
            allowed: [
                'command',
                'step',
                'error',
                'status',
                'train_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['realm', 'train'],
        },
        sort: {
            allowed: ['command', 'step', 'status', 'created_at', 'updated_at'],
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
