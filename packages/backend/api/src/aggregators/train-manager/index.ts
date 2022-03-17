/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerBuildingQueueEvent, TrainManagerExtractingQueueEvent,
    TrainManagerExtractingQueuePayload, TrainManagerRoutingQueueEvent,
} from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../config/mq';
import { handleTrainManagerExtractingQueueEvent } from './extracting';
import { handleTrainManagerBuildingQueueEvent } from './building';
import { handleTrainManagerRoutingQueueEvent } from './routing';

export function buildTrainManagerAggregator() {
    const extractingValues : string[] = Object.values(TrainManagerExtractingQueueEvent);
    const buildingValues : string[] = Object.values(TrainManagerBuildingQueueEvent);
    const routingValues : string[] = Object.values(TrainManagerRoutingQueueEvent);

    function start() {
        return consumeQueue({ routingKey: MessageQueueRoutingKey.AGGREGATOR_RESULT_SERVICE_EVENT }, {
            $any: async (message: Message) => {
                // handle extracting events
                const extractingEventIndex = extractingValues.indexOf(message.type);
                if (extractingEventIndex !== -1) {
                    await handleTrainManagerExtractingQueueEvent(
                        message.data as TrainManagerExtractingQueuePayload,
                        message.type as TrainManagerExtractingQueueEvent,
                    );
                }

                // handle building events
                const buildingEventIndex = buildingValues.indexOf(message.type);
                if (buildingEventIndex !== -1) {
                    await handleTrainManagerBuildingQueueEvent(
                        message.data as TrainManagerExtractingQueuePayload,
                        message.type as TrainManagerBuildingQueueEvent,
                    );
                }

                // handle routing events
                const routingEventIndex = routingValues.indexOf(message.type);
                if (routingEventIndex !== -1) {
                    await handleTrainManagerRoutingQueueEvent(
                        message.data as TrainManagerExtractingQueuePayload,
                        message.type as TrainManagerRoutingQueueEvent,
                    );
                }
            },
        });
    }

    return {
        start,
    };
}
