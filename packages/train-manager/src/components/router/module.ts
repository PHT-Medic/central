/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { isComponentQueuePayload } from '@personalhealthtrain/central-server-common';
import { consume } from 'amqp-extension';
import { TrainManagerComponent } from '@personalhealthtrain/central-common';
import { executeExtractorCommand } from '../train-extractor';
import { executeBuilderCommand } from '../train-builder';
import { executeRouterCommand } from '../train-router';
import { useLogger } from '../../core';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';

export function buildCommandRouterComponent() {
    function start() {
        return consume({
            exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY },
        }, {
            $any: async (message) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentQueuePayload(payload)) {
                    useLogger().warn('The queue payload could not be read as component queue payload.');
                }

                useLogger().debug('Command received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                });

                const context : ComponentExecutionContext<any, any> = {
                    command: payload.metadataa.command,
                    data: payload.data,
                };

                switch (payload.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await executeBuilderCommand(context);
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await executeExtractorCommand(context);
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await executeRouterCommand(context);
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
