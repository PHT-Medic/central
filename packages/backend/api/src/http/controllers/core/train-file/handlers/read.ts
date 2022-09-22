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
import { applyFilters, useDataSource } from 'typeorm-extension';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

export async function getOneTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        !req.ability.has(PermissionID.TRAIN_ADD) &&
        !req.ability.has(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const { fileId } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);

    const entity = await repository.findOneBy({
        id: fileId,
    });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyTrainFileGetManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { filter } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainFileEntity);
    const query = repository.createQueryBuilder('trainFile')
        .where('trainFile.train_id = :trainId', { trainId: id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'realm_id'],
    });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
            },
        },
    });
}
