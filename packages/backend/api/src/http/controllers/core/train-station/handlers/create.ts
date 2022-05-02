/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError } from '@typescript-error/http';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { runTrainStationValidation } from './utils';
import env from '../../../../../env';
import { TrainEntity } from '../../../../../domains/core/train/entity';

export async function createTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runTrainStationValidation(req, 'create');

    if (!result.meta.station.ecosystem) {
        throw new BadRequestError('The referenced station must be assigned to an ecosystem.');
    }

    if (!result.meta.station.registry_id) {
        throw new BadRequestError('The referenced station must be assigned to a registry');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);

    let entity = repository.create(result.data);

    if (env.skipTrainApprovalOperation) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    if (!entity.index) {
        entity.index = await repository.countBy({
            train_id: entity.train_id,
        });
    }

    entity = await repository.save(entity);

    result.meta.train.stations += 1;
    const trainRepository = dataSource.getRepository(TrainEntity);
    await trainRepository.save(result.meta.train);

    entity.train = result.meta.train;
    entity.station = result.meta.station;

    return res.respondCreated({
        data: entity,
    });
}
