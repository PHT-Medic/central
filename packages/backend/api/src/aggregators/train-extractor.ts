/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainExtractorMode, TrainExtractorQueuePayload, TrainResultStatus, hasOwnProperty,
} from '@personalhealthtrain/central-common';
import { Message, consumeQueue, publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import { MessageQueueRoutingKey } from '../config/mq';
import { TrainEntity } from '../domains/core/train/entity';
import { AggregatorTrainExtractorEvent } from '../domains/special/aggregator';
import { extractTrainConfigFromTrainExtractorPayload } from '../domains/special/train-extractor/utils';
import { syncTrainConfigToDatabase } from '../domains/core/train-config/sync';
import { buildTrainBuilderQueueMessage } from '../domains/special/train-builder/queue';
import { TrainBuilderCommand } from '../domains/special/train-builder/type';

const EventStatusMap : Record<AggregatorTrainExtractorEvent, TrainResultStatus | null> = {
    [AggregatorTrainExtractorEvent.STARTING]: TrainResultStatus.STARTING,
    [AggregatorTrainExtractorEvent.STARTED]: TrainResultStatus.STARTED,
    [AggregatorTrainExtractorEvent.STOPPING]: TrainResultStatus.STOPPING,
    [AggregatorTrainExtractorEvent.STOPPED]: TrainResultStatus.STOPPED,
    [AggregatorTrainExtractorEvent.FAILED]: TrainResultStatus.FAILED,
    [AggregatorTrainExtractorEvent.DOWNLOADING]: TrainResultStatus.DOWNLOADING,
    [AggregatorTrainExtractorEvent.DOWNLOADED]: TrainResultStatus.DOWNLOADED,
    [AggregatorTrainExtractorEvent.EXTRACTING]: TrainResultStatus.EXTRACTING,
    [AggregatorTrainExtractorEvent.EXTRACTED]: TrainResultStatus.FINISHED,
    [AggregatorTrainExtractorEvent.UNKNOWN]: null,
};

async function handleTrainExtractorEvent(
    data: TrainExtractorQueuePayload,
    event: AggregatorTrainExtractorEvent,
) {
    if (!(hasOwnProperty(EventStatusMap, event))) {
        return;
    }

    const trainRepository = getRepository(TrainEntity);

    const train = await trainRepository.findOne(data.repositoryName);
    if (typeof train === 'undefined') {
        return;
    }

    switch (data.mode) {
        case TrainExtractorMode.WRITE: {
            train.result_status = EventStatusMap[event];

            await trainRepository.save(train);

            break;
        }
        case TrainExtractorMode.READ: {
            const config = extractTrainConfigFromTrainExtractorPayload(data);
            if (typeof config === 'undefined') {
                return;
            }

            const result = await syncTrainConfigToDatabase(config);

            train.run_station_id = result.stationId;
            train.run_station_index = result.position;

            await trainRepository.save(train);

            const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.META_BUILD, train);
            await publishMessage(queueMessage);
            break;
        }
    }
}

export function buildTrainResultAggregator() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_RESULT_SERVICE_EVENT }, {
            $any: async (message: Message) => {
                await handleTrainExtractorEvent(
                    message.data as TrainExtractorQueuePayload,
                    message.type as AggregatorTrainExtractorEvent,
                );
            },
        });
    }

    return {
        start,
    };
}
