/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { consumeQueue } from 'amqp-extension';
import { TrainManagerComponent } from '@personalhealthtrain/central-common';
import { MessageQueueSelfRoutingKey } from '../../config/services/rabbitmq';
import { executeExtractorCommand } from '../extractor';
import { executeBuilderCommand } from '../builder';
import { executeRouterCommand } from '../router';
import { useLogger } from '../../modules/log';

export function buildCommandRouterComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueSelfRoutingKey.COMMAND }, {
            $any: async (message) => {
                useLogger().debug('Command received', {
                    component: message.metadata.component,
                    command: message.metadata.command,
                });

                switch (message.metadata.component) {
                    case TrainManagerComponent.BUILDER: {
                        await executeBuilderCommand(message.metadata.command, message);
                        break;
                    }
                    case TrainManagerComponent.EXTRACTOR: {
                        await executeExtractorCommand(message.metadata.command, message);
                        break;
                    }
                    case TrainManagerComponent.ROUTER: {
                        await executeRouterCommand(message.metadata.command, message);
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
