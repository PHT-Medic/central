/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import { isComponentQueuePayload } from '@personalhealthtrain/central-server-common';
import { consume } from 'amqp-extension';
import { Component } from '../../../components/constants';
import { executeExtractorCommand } from '../../../components/extractor';
import { executeBuilderCommand } from '../../../components/builder';
import { executeRouterCommand } from '../../../components/router';
import { useLogger } from '../../log';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';

export function buildComponentRouter() {
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
                    case Component.BUILDER: {
                        await executeBuilderCommand(context);
                        break;
                    }
                    case Component.EXTRACTOR: {
                        await executeExtractorCommand(context);
                        break;
                    }
                    case Component.ROUTER: {
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
