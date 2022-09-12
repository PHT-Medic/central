/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { runTrainStationValidation } from '../utils';

export async function updateTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);
    let trainStation = await repository.findOneBy({ id });

    if (!trainStation) {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, trainStation.station_realm_id);
    const isAuthorizedForStation = req.ability.has(PermissionID.TRAIN_APPROVE);

    const isAuthorityOfTrain = isPermittedForResourceRealm(req.realmId, trainStation.train_realm_id);
    const isAuthorizedForTrain = req.ability.has(PermissionID.TRAIN_EDIT);

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

    trainStation = repository.merge(trainStation, result.data);

    trainStation = await repository.save(trainStation);

    return res.respondCreated({
        data: trainStation,
    });
}
