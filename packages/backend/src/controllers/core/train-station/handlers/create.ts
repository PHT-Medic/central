/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, Train, TrainStationApprovalStatus } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { TrainStationEntity } from '../../../../domains/core/train-station/entity';
import { runTrainStationValidation } from './utils';
import { TrainEntity } from '../../../../domains/core/train/entity';
import { StationEntity } from '../../../../domains/core/station/entity';
import env from '../../../../env';

export async function createTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const data : Partial<TrainStationEntity> = await runTrainStationValidation(req, 'create');

    // train
    const trainRepository = getRepository<Train>(TrainEntity);
    const train = await trainRepository.findOne(data.train_id);

    if (typeof train === 'undefined') {
        throw new NotFoundError('The referenced train was not found.');
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError();
    }

    data.train_realm_id = train.realm_id;

    // station
    const stationRepository = getRepository(StationEntity);
    const station = await stationRepository.findOne(data.station_id);

    if (typeof station === 'undefined') {
        throw new NotFoundError('The referenced station was not found.');
    }

    data.station_realm_id = station.realm_id;

    const repository = getRepository(TrainStationEntity);

    let entity = repository.create(data);

    if (env.skipTrainApprovalOperation) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    train.stations += 1;
    await trainRepository.save(train);

    return res.respondCreated({
        data: entity,
    });
}
