/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { RoutingError } from './error';
import { writeProcessedEvent } from './write-processed';
import { writeProcessingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { processMessage } from './process';

export function createRoutingComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.ROUTE]: async (message: Message) => {
            useLogger().debug('Route event received', {
                component: 'routing',
            });

            await Promise.resolve(message)
                .then(writeProcessingEvent)
                .then(processMessage)
                .then(writeProcessedEvent)
                .catch((err: Error) => {
                    console.log(err);

                    return writeFailedEvent(message, err as RoutingError);
                });
        },
    };
}
