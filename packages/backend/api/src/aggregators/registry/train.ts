/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { TrainBuildStatus, TrainRunStatus, TrainStationRunStatus } from '@personalhealthtrain/central-common';
import { TrainEntity } from '../../domains/core/train/entity';
import { TrainStationEntity } from '../../domains/core/train-station/entity';
import { AggregatorRegistryEvent, AggregatorTrainEventPayload } from '../../domains/special/aggregator';
import { useLogger } from '../../config/log';
import { buildTrainBuilderQueueMessage } from '../../domains/special/train-builder/queue';
import { TrainBuilderCommand } from '../../domains/special/train-builder/type';

export async function handleRegistryTrainEvent(message: Message) {
    const repository = getRepository(TrainEntity);

    const data : AggregatorTrainEventPayload = message.data as AggregatorTrainEventPayload;

    useLogger()
        .info(`Received registry ${message.type} event.`, { aggregator: 'registry', payload: message.data });

    const entity = await repository.findOne(data.id);

    if (message.type === AggregatorRegistryEvent.TRAIN_MOVED) {
        const trainStationRepository = getRepository(TrainStationEntity);
        const trainStation = await trainStationRepository.findOne({
            train_id: entity.id,
            station_id: data.stationId,
        });

        if (typeof trainStation !== 'undefined') {
            trainStation.run_status = data.status as TrainStationRunStatus;
            trainStation.artifact_digest = data.artifactDigest;
            trainStation.artifact_tag = data.artifactTag;

            await trainStationRepository.save(trainStation);

            entity.run_status = TrainRunStatus.RUNNING;
            entity.run_station_id = trainStation.id;
            entity.run_station_index = trainStation.index;
        }
    }

    switch (message.type) {
        case AggregatorRegistryEvent.TRAIN_INITIALIZED:
            entity.build_status = TrainBuildStatus.FINISHED;

            entity.run_station_index = null;
            entity.run_station_id = null;
            break;
        case AggregatorRegistryEvent.TRAIN_FINISHED:
            entity.run_status = TrainRunStatus.FINISHED;
            entity.run_station_id = null;
            entity.run_station_index = null;
            break;
    }

    await repository.save(entity);

    if (message.type === AggregatorRegistryEvent.TRAIN_MOVED) {
        const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.META_BUILD, entity);
        await publishMessage(queueMessage);
    }
}
