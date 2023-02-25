/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ComponentError, isComponentEventQueuePayload } from '@personalhealthtrain/central-server-common';
import { ComponentName } from '@personalhealthtrain/train-manager';
import type { ConsumeMessage } from 'amqp-extension';
import { consume } from 'amqp-extension';
import { useLogger } from '../../config';
import type { Aggregator } from '../type';
import { handleTrainManagerExtractorEvent } from './extractor';
import { handleTrainManagerBuilderEvent } from './builder';
import { handleTrainManagerRouterEvent } from './router';

export function buildTrainManagerAggregator() : Aggregator {
    return {
        start: () => consume({
            exchange: {
                routingKey: 'api.aggregator.tm',
            },
        }, {
            $any: async (message: ConsumeMessage) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentEventQueuePayload(payload)) {
                    useLogger().error('Train-Manager aggregation event could not be processed.');
                    return;
                }

                let error : ComponentError | undefined;

                if (payload.error) {
                    error = new ComponentError(payload.error.message);
                    error.setOption('code', payload.error.code);
                    error.setOption('step', payload.error.step);
                }

                useLogger().debug('Event received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                    event: payload.metadata.event,
                });

                switch (payload.metadata.component) {
                    case ComponentName.BUILDER: {
                        await handleTrainManagerBuilderEvent({
                            command: payload.metadata.command as any,
                            event: payload.metadata.event as any,
                            data: payload.data as any,
                            ...(error ? { error } : {}),
                        });
                        break;
                    }
                    case ComponentName.EXTRACTOR: {
                        await handleTrainManagerExtractorEvent({
                            command: payload.metadata.command as any,
                            event: payload.metadata.event as any,
                            data: payload.data as any,
                            ...(error ? { error } : {}),
                        });
                        break;
                    }
                    case ComponentName.ROUTER: {
                        await handleTrainManagerRouterEvent({
                            command: payload.metadata.command as any,
                            event: payload.metadata.event as any,
                            data: payload.data as any,
                            ...(error ? { error } : {}),
                        });
                        break;
                    }
                }
            },
        }),
    };
}
