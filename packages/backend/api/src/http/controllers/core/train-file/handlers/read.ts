/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import { applyFilters, useDataSource } from 'typeorm-extension';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { useRequestEnv } from '../../../../request';

export async function getOneTrainFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionID.TRAIN_ADD) &&
        !ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const id = useRequestParam(req, 'fileId');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);

    const entity = await repository.findOneBy({
        id,
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyTrainFileGetManyRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const { filter } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);
    const query = repository.createQueryBuilder('trainFile')
        .where('trainFile.train_id = :trainId', { trainId: id });

    onlyRealmPermittedQueryResources(query, useRequestEnv(req, 'realmId'));

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'realm_id'],
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
        },
    });
}
