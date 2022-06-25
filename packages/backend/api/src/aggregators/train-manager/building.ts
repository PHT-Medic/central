/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainBuildStatus,
    TrainManagerBuilderBuildPayload,
    TrainManagerBuilderCommand,
    TrainManagerBuilderEvent,
    TrainManagerComponent,
    TrainManagerErrorEventQueuePayload,
    TrainManagerExtractorExtractQueuePayload,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { Message } from 'amqp-extension';
import { TrainEntity } from '../../domains/core/train/entity';
import { TrainLogSaveContext, saveTrainLog } from '../../domains/core/train-log';

export async function handleTrainManagerBuilderEvent(
    command: TrainManagerBuilderCommand,
    event: TrainManagerBuilderEvent,
    message: Message,
) {
    const data = message.data as TrainManagerExtractorExtractQueuePayload;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const entity = await repository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    let trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: TrainManagerComponent.BUILDER,
    };

    switch (event) {
        case TrainManagerBuilderEvent.NONE:
            entity.build_status = null;
            break;
        case TrainManagerBuilderEvent.BUILDING:
            entity.build_status = TrainBuildStatus.STARTED;

            trainLogContext.status = TrainBuildStatus.STARTED;
            break;
        case TrainManagerBuilderEvent.FAILED: {
            entity.build_status = TrainBuildStatus.FAILED;

            const payload = data as TrainManagerErrorEventQueuePayload<TrainManagerBuilderBuildPayload>;
            trainLogContext = {
                ...trainLogContext,
                error: true,
                errorCode: `${payload.error.code}`,
                step: payload.error.step,
            };

            break;
        }
        case TrainManagerBuilderEvent.PUSHED:
            entity.build_status = TrainBuildStatus.FINISHED;

            trainLogContext.status = TrainBuildStatus.FINISHED;
            break;
    }

    if (
        event === TrainManagerBuilderEvent.BUILDING ||
        event === TrainManagerBuilderEvent.FAILED ||
        event === TrainManagerBuilderEvent.NONE
    ) {
        entity.run_status = null;
        entity.run_station_index = null;
        entity.run_status = null;
        entity.result_status = null;
    }

    await repository.save(entity);

    if (trainLogContext.status) {
        await saveTrainLog(trainLogContext);
    }
}
