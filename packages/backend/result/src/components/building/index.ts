/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand, hasOwnProperty } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { BuildingError } from './error';
import { writeProcessedEvent } from './write-processed';
import { writeProcessingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { processMessage } from './process';

export function createBuildingComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.BUILD]: async (message: Message) => {
            useLogger().debug('Build event received', {
                component: 'building',
            });

            await Promise.resolve(message)
                .then(writeProcessingEvent)
                .then(processMessage)
                .then(writeProcessedEvent)
                .catch((err: Error) => writeFailedEvent(message, err as BuildingError));
        },
    };
}
