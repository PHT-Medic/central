/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerExtractingQueueEvent,
    TrainManagerExtractingQueuePayload,
    TrainManagerExtractionMode, TrainResultStatus,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { publishMessage } from 'amqp-extension';
import { useLogger } from '../../config/log';
import { TrainEntity } from '../../domains/core/train/entity';
import { extractTrainConfigFromTrainExtractorPayload } from '../../domains/special/train-manager';
import { syncTrainConfigToDatabase } from '../../domains/core/train-config/sync';
import { buildTrainBuilderQueueMessage } from '../../domains/special/train-builder/queue';
import { TrainBuilderCommand } from '../../domains/special/train-builder/type';

export async function handleTrainManagerExtractingQueueEvent(
    data: TrainManagerExtractingQueuePayload,
    event: TrainManagerExtractingQueueEvent,
) {
    useLogger()
        .info(`Received train-manager extracting ${event} event.`, {
            aggregator: 'train-manager', payload: data,
        });

    const trainRepository = getRepository(TrainEntity);

    const train = await trainRepository.findOne(data.repositoryName);
    if (typeof train === 'undefined') {
        return;
    }

    switch (data.mode) {
        case TrainManagerExtractionMode.WRITE: {
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
                    status = TrainResultStatus.PROCESSED;
                    break;
                case TrainManagerExtractingQueueEvent.FINISHED:
                    status = TrainResultStatus.FINISHED;
                    break;
                case TrainManagerExtractingQueueEvent.FAILED:
                    status = TrainResultStatus.FAILED;
                    break;
            }

            train.result_status = status;

            await trainRepository.save(train);

            break;
        }
        case TrainManagerExtractionMode.READ: {
            const config = extractTrainConfigFromTrainExtractorPayload(data);
            if (typeof config === 'undefined') {
                return;
            }

            const result = await syncTrainConfigToDatabase(config);
            console.log(result);

            train.run_station_id = result.stationId;
            train.run_station_index = result.position;

            await trainRepository.save(train);

            const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.META_BUILD, train);
            await publishMessage(queueMessage);
            break;
        }
    }
}
