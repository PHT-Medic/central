/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { MasterImageGroupEntity } from '../../../../../domains/master-image-group/entity';

export async function getOneMasterImageGroupRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageGroupEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyMasterImageGroupRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageGroupEntity);
    const query = repository.createQueryBuilder('imageGroup');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'imageGroup',
        filters: {
            allowed: ['id', 'name', 'path', 'virtual_path'],
        },
        pagination: {
            maxLimit: 50,
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
