/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainRunStatus } from '@personalhealthtrain/central-common';
import type { RouterStartEventContext } from '@personalhealthtrain/train-manager';
import { ComponentName, RouterEvent } from '@personalhealthtrain/train-manager';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../../../domains/core/train';
import type { TrainLogSaveContext } from '../../../domains/core/train-log';
import { TrainStationEntity } from '../../../domains/core/train-station/entity';

export async function handleTrainManagerRouterStartEvent(context: RouterStartEventContext) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);
    const entity = await repository.findOneBy({ id: context.data.id });
    if (!entity) {
        return;
    }

    const trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: ComponentName.ROUTER,
        command: context.command,
        event: context.event,
    };

    switch (context.event) {
        case RouterEvent.STARTED: {
            entity.run_status = TrainRunStatus.STARTED;
            trainLogContext.status = TrainRunStatus.STARTED;

            const trainStationRepository = dataSource.getRepository(TrainStationEntity);
            const trainStations = await trainStationRepository.findBy({
                train_id: entity.id,
            });

            for (let i = 0; i < trainStations.length; i++) {
                trainStations[i].run_status = null;

                await trainStationRepository.save(trainStations[i]);
            }

            await repository.save(entity);
            break;
        }
    }
}
