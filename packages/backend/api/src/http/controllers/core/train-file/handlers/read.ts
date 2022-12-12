/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/common';
import { onlyRealmReadableQueryResources } from '@authup/server-database';
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

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id)) {
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

    onlyRealmReadableQueryResources(query, useRequestEnv(req, 'realm'));

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
