/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { TrainManagerRouterCommand } from '@personalhealthtrain/central-common';
import {
    processCheckCommand,
    processRouteCommand,
    processStartCommand,
    writeCheckedEvent,
    writeCheckingEvent,
    writeRoutedEvent,
    writeRoutingEvent,
    writeStartedEvent,
    writeStartingEvent,
} from './commands';
import { writeFailedEvent } from './write-failed';
import { extendPayload } from '../utils/train';

export async function executeRouterCommand(
    command: TrainManagerRouterCommand,
    message: Message,
) : Promise<void> {
    switch (command) {
        case TrainManagerRouterCommand.CHECK: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeCheckingEvent)
                .then(processCheckCommand)
                .then(writeCheckedEvent)
                .catch((err: Error) => writeFailedEvent(message, err));
            break;
        }
        case TrainManagerRouterCommand.ROUTE: {
            await Promise.resolve(message)
                .then(writeRoutingEvent)
                .then(processRouteCommand)
                .then(writeRoutedEvent)
                .catch((err: Error) => writeFailedEvent(message, err));

            break;
        }
        case TrainManagerRouterCommand.START: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeStartingEvent)
                .then(processStartCommand)
                .then(writeStartedEvent)
                .catch((err: Error) => writeFailedEvent(message, err));
        }
    }
}
