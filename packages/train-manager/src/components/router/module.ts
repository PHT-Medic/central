/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consume } from 'amqp-extension';
import { TrainManagerComponent } from '@personalhealthtrain/central-common';
import type { RouterQueuePayload } from './type';
import { executeExtractorCommand } from '../train-extractor';
import { executeBuilderCommand } from '../train-builder';
import { executeRouterCommand } from '../train-router';
import { useLogger } from '../../core/log';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';

export function buildCommandRouterComponent() {
    function start() {
        return consume({
            exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY },
        }, {
            $any: async (message) => {
                const messageContent : RouterQueuePayload<any> = JSON.parse(message.content.toString('utf-8'));

                useLogger().debug('Command received', {
                    component: messageContent.metadata.component,
                    command: messageContent.metadata.command,
                    ...(messageContent.metadata.event ? { event: messageContent.metadata.event } : {}),
                });

                switch (messageContent.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await executeBuilderCommand(
                            messageContent.metadata.command as any,
                            messageContent.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await executeExtractorCommand(
                            messageContent.metadata.command as any,
                            messageContent.data,
                        );
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await executeRouterCommand(
                            messageContent.metadata.command as any,
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
