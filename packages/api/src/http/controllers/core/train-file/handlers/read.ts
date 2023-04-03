/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/core';
import { useRequestQuery } from '@routup/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import { applyFilters, useDataSource } from 'typeorm-extension';
import { onlyRealmWritableQueryResources } from '../../../../../domains';
import { TrainFileEntity } from '../../../../../domains/train-file/entity';
import { useRequestEnv } from '../../../../request';

export async function getOneTrainFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.TRAIN_ADD) &&
        !ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);

    const entity = await repository.findOneBy({
        id,
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyTrainFileGetManyRouteHandler(req: Request, res: Response) : Promise<any> {
    const { filter } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);
    const query = repository.createQueryBuilder('trainFile');

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'));

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'train_id', 'realm_id'],
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
        },
    });
}
