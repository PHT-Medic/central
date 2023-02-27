/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/common';
import { PermissionID } from '@personalhealthtrain/central-common';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { TrainStationEntity } from '../../../../../domains/train-station/entity';
import { useRequestEnv } from '../../../../request';
import { runTrainStationValidation } from '../utils';

export async function updateTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const ability = useRequestEnv(req, 'ability');

    const isAuthorityOfStation = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.station_realm_id);
    const isAuthorizedForStation = ability.has(PermissionID.TRAIN_APPROVE);

    const isAuthorityOfTrain = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.train_realm_id);
    const isAuthorizedForTrain = ability.has(PermissionID.TRAIN_EDIT);

    if (
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfTrain && isAuthorizedForTrain)
    ) {
        throw new ForbiddenError();
    }

    const result = await runTrainStationValidation(req, 'update');

    if (!isAuthorityOfStation) {
        if (result.data.approval_status) {
            delete result.data.approval_status;
        }

        if (result.data.comment) {
            delete result.data.comment;
        }
    }

    if (!isAuthorityOfTrain) {
        if (result.data.index) {
            delete result.data.index;
        }
    }

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
