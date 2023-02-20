/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { useRequestEnv } from '../../../../request';
import { runTrainStationValidation } from '../utils';
import { useEnv } from '../../../../../config/env';
import { TrainEntity } from '../../../../../domains/core/train';

export async function createTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.TRAIN_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runTrainStationValidation(req, 'create');

    if (useEnv('env') !== 'test' && !result.relation.station.ecosystem) {
        throw new BadRequestError('The referenced station must be assigned to an ecosystem.');
    }

    // todo: this should also work in the test-suite
    if (useEnv('env') !== 'test' && !result.relation.station.registry_id) {
        throw new BadRequestError('The referenced station must be assigned to a registry');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainStationEntity);

    let entity = repository.create(result.data);

    if (useEnv('skipTrainApprovalOperation')) {
        entity.approval_status = TrainStationApprovalStatus.APPROVED;
    }

    if (!entity.index) {
        entity.index = await repository.countBy({
            train_id: entity.train_id,
        });
    }

    entity = await repository.save(entity);

    result.relation.train.stations += 1;
    const trainRepository = dataSource.getRepository(TrainEntity);
    await trainRepository.save(result.relation.train);

    entity.train = result.relation.train;
    entity.station = result.relation.station;

    return sendCreated(res, entity);
}
