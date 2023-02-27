/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component,
} from '@personalhealthtrain/central-server-common';
import { isComponentCommandQueuePayload } from '@personalhealthtrain/central-server-common';
import { consume } from 'amqp-extension';
import { ComponentName } from '../../../constants';
import { executeCoreCommand } from '../../../core';
import {
    executeBuilderCommand,
    executeExtractorCommand,
    executeRouterCommand,
} from '../../../index';
import { useLogger } from '../../../../core';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';

export function buildComponentRouter() : Component {
    function start() {
        return consume({
            exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY },
        }, {
            $any: async (message) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentCommandQueuePayload(payload)) {
                    useLogger().warn('The queue payload could not be read as component queue payload.');
                }

                useLogger().debug('Command received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                });

                const context = {
                    command: payload.metadata.command,
                    data: payload.data,
                };

                switch (payload.metadata.component) {
                    case ComponentName.BUILDER: {
                        await executeBuilderCommand(context);
                        break;
                    }
                    case ComponentName.CORE: {
                        await executeCoreCommand(context);
                        break;
                    }
                    case ComponentName.EXTRACTOR: {
                        await executeExtractorCommand(context);
                        break;
                    }
                    case ComponentName.ROUTER: {
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
