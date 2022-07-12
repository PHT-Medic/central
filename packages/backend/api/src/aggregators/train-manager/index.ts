/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import { Message, consumeQueue } from 'amqp-extension';
import { MessageQueueRoutingKey } from '../../config/mq';
import { handleTrainManagerExtractorEvent } from './extracting';
import { handleTrainManagerBuilderEvent } from './building';
import { handleTrainManagerRouterEvent } from './routing';
import { useLogger } from '../../config/log';

export function buildTrainManagerAggregator() {
    function start() {
        return consumeQueue({
            routingKey: MessageQueueRoutingKey.AGGREGATOR_RESULT_SERVICE_EVENT,
        }, {
            $any: async (message: Message) => {
                useLogger().debug('Event received', {
                    component: message.metadata.component,
                    command: message.metadata.command,
                    event: message.metadata.event,
                });

                switch (message.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await handleTrainManagerBuilderEvent(
                            message.metadata.command,
                            message.metadata.event,
                            message,
                        );
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await handleTrainManagerExtractorEvent(
                            message.metadata.command,
                            message.metadata.event,
                            message,
                        );
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await handleTrainManagerRouterEvent(
                            message.metadata.command,
                            message.metadata.event,
                            message,
                        );
                        break;
                    }
                }
            },
        });
    }

    return {
        start,
    };
}
