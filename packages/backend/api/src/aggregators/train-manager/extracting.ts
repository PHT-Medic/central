/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainBuildStatus,
    TrainManagerComponent, TrainManagerErrorEventQueuePayload,
    TrainManagerExtractorCommand,
    TrainManagerExtractorEvent,
    TrainManagerExtractorExtractQueuePayload,
    TrainResultStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { Message } from 'amqp-extension';
import { TrainEntity } from '../../domains/core/train/entity';
import { TrainLogSaveContext, saveTrainLog } from '../../domains/core/train-log';

export async function handleTrainManagerExtractorEvent(
    command: TrainManagerExtractorCommand,
    event: TrainManagerExtractorEvent,
    message: Message,
) {
    const data = message.data as TrainManagerExtractorExtractQueuePayload;

    const dataSource = await useDataSource();
    const trainRepository = dataSource.getRepository(TrainEntity);

    const entity = await trainRepository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    let trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: TrainManagerComponent.EXTRACTOR,
        command,
        event,
    };

    // -------------------------------------------------------------------------------

    let status : TrainResultStatus;

    switch (event) {
        case TrainManagerExtractorEvent.DOWNLOADING:
            status = TrainResultStatus.DOWNLOADING;
            break;
        case TrainManagerExtractorEvent.DOWNLOADED:
            status = TrainResultStatus.DOWNLOADED;
            break;
        case TrainManagerExtractorEvent.EXTRACTING:
            status = TrainResultStatus.PROCESSING;
            break;
        case TrainManagerExtractorEvent.EXTRACTED:
            status = TrainResultStatus.FINISHED;
            break;
        case TrainManagerExtractorEvent.FAILED: {
            status = TrainResultStatus.FAILED;

            const payload = data as TrainManagerErrorEventQueuePayload;
            trainLogContext = {
                ...trainLogContext,
                status: TrainBuildStatus.FAILED,

                error: true,
                errorCode: `${payload.error.code}`,
                step: payload.error.step,
            };
            break;
        }
    }

    entity.result_status = status;

    await trainRepository.save(entity);

    await saveTrainLog({
        ...trainLogContext,
        status,
    });
}
