/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerExtractingMode,
    TrainManagerExtractingQueueEvent,
    TrainManagerExtractingQueuePayload, TrainResultStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';

export async function handleTrainManagerExtractingQueueEvent(
    data: TrainManagerExtractingQueuePayload,
    event: TrainManagerExtractingQueueEvent,
) {
    useLogger()
        .info(`Received train-manager extracting ${event} event.`, {
            aggregator: 'train-manager', payload: data,
        });

    const dataSource = await useDataSource();
    const trainRepository = dataSource.getRepository(TrainEntity);

    const entity = await trainRepository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    switch (data.mode) {
        case TrainManagerExtractingMode.NONE:
        case TrainManagerExtractingMode.WRITE: {
            let status : TrainResultStatus;

            switch (event) {
                case TrainManagerExtractingQueueEvent.STARTED:
                    status = TrainResultStatus.STARTED;
                    break;
                case TrainManagerExtractingQueueEvent.DOWNLOADING:
                    status = TrainResultStatus.DOWNLOADING;
                    break;
                case TrainManagerExtractingQueueEvent.DOWNLOADED:
                    status = TrainResultStatus.DOWNLOADED;
                    break;
                case TrainManagerExtractingQueueEvent.PROCESSING:
                    status = TrainResultStatus.PROCESSING;
                    break;
                case TrainManagerExtractingQueueEvent.PROCESSED:
                    status = TrainResultStatus.FINISHED;
                    break;
                case TrainManagerExtractingQueueEvent.FINISHED:
                    status = TrainResultStatus.FINISHED;
                    break;
                case TrainManagerExtractingQueueEvent.FAILED:
                    status = TrainResultStatus.FAILED;
                    break;
            }

            entity.result_status = status;

            await trainRepository.save(entity);

            break;
        }
    }
}
