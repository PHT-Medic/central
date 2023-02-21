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
import type { Aggregator } from '../type';
import { handleTrainManagerExtractorEvent } from './extracting';
import { handleTrainManagerBuilderEvent } from './building';
import { handleTrainManagerRouterEvent } from './routing';
import type { AggregatorTrainManagerQueuePayload } from './type';

export function buildTrainManagerAggregator() : Aggregator {
    return {
        start: () => consume({
            exchange: {
                routingKey: 'api.aggregator.tm',
            },
        }, {
            $any: async (message: ConsumeMessage) => {
                const payload : AggregatorTrainManagerQueuePayload<any> = JSON.parse(message.content.toString('utf-8'));
                useLogger().debug('Event received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                    event: payload.metadata.event,
                });

                switch (payload.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await handleTrainManagerBuilderEvent(
                            payload.metadata.command as any,
                            payload.metadata.event as any,
                            payload.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await handleTrainManagerExtractorEvent(
                            payload.metadata.command as any,
                            payload.metadata.event as any,
                            payload.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await handleTrainManagerRouterEvent(
                            payload.metadata.command as any,
                            payload.metadata.event as any,
                            payload.data,
                        );
                        break;
                    }
                }
            },
        }),
    };
}
