/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/central-common';
import { isRealmResourceWritable } from '@authup/common';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../request';
import { runTrainValidation } from '../utils';
import { TrainEntity } from '../../../../../domains/core/train';

export async function updateTrainRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runTrainValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realmId'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (
        entity.registry_id &&
        result.data.registry_id &&
        entity.registry_id !== result.data.registry_id
    ) {
        throw new BadRequestError('The registry can not be changed after it is specified.');
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return sendAccepted(res, entity);
}
