/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDataSource } from 'typeorm-extension';
import { TrainLogSaveContext } from './type';
import { TrainLogEntity } from './entity';

export async function saveTrainLog(context: TrainLogSaveContext) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainLogEntity);

    const entity = repository.create({
        train_id: context.train.id,
        realm_id: context.train.realm_id,

        component: context.component,
        command: context.command,
        event: context.event,
        step: context.step,

        error: context.error,

        status: context.status,
        status_message: context.statusMessage,
    });

    if (context.errorCode) {
        entity.error_code = context.errorCode;
        entity.error = true;
    }

    const meta : Record<string, any> = {};
    if (context.train.run_station_id) {
        meta.station_id = context.train.run_station_id;
    }

    if (context.train.run_station_index) {
        meta.station_index = context.train.run_station_index;
    }

    entity.meta = JSON.stringify(meta);

    await repository.save(entity);
}
