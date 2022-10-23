/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    applyQuery,
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { TrainLogEntity } from '../../../../../domains/core/train-log';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainLogRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id, include } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainLogEntity);
    const query = repository.createQueryBuilder('trainLog')
        .where('trainLog.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['train'],
        defaultAlias: 'trainLog',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainLogRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainLogEntity);
    const query = await repository.createQueryBuilder('trainLog');
    query.distinctOn(['trainLog.id']);

    const { pagination } = applyQuery(query, req.query, {
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
