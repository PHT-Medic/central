/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { writeProcessedEvent } from './write-processed';
import { writeProcessingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { processRouteCommand } from './process';
import { processStartCommand } from './start';

export function createRoutingComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.ROUTE]: async (message: Message) => {
            useLogger().debug('Route event received', {
                component: 'routing',
            });

            await Promise.resolve(message)
                .then(writeProcessingEvent)
                .then(processRouteCommand)
                .then(writeProcessedEvent)
                .catch((err: Error) => writeFailedEvent(message, err));
        },

        [TrainManagerQueueCommand.ROUTE_START]: async (message: Message) => {
            useLogger().debug('Route start event received', {
                component: 'routing',
            });

            await Promise.resolve(message)
                .then(processStartCommand)
                .catch((err: Error) => writeFailedEvent(message, err));
        },
    };
}
