/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import type { ConsumeMessage } from 'amqp-extension';
import { consume } from 'amqp-extension';
import { useLogger } from '../../config';
import type { AggregatorTrainManagerQueuePayload } from '../type';
import { handleTrainManagerExtractorEvent } from './extracting';
import { handleTrainManagerBuilderEvent } from './building';
import { handleTrainManagerRouterEvent } from './routing';

export function buildTrainManagerAggregator() {
    function start() {
        return consume({
            exchange: {
                routingKey: 'api.aggregator.tm',
            },
        }, {
            $any: async (message: ConsumeMessage) => {
                const messageContent : AggregatorTrainManagerQueuePayload<any> = JSON.parse(message.content.toString('utf-8'));
                useLogger().debug('Event received', {
                    component: messageContent.metadata.component,
                    command: messageContent.metadata.command,
                    event: messageContent.metadata.event,
                });

                switch (messageContent.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await handleTrainManagerBuilderEvent(
                            messageContent.metadata.command as any,
                            messageContent.metadata.event as any,
                            messageContent.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await handleTrainManagerExtractorEvent(
                            messageContent.metadata.command as any,
                            messageContent.metadata.event as any,
                            messageContent.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await handleTrainManagerRouterEvent(
                            messageContent.metadata.command as any,
                            messageContent.metadata.event as any,
                            messageContent.data,
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
