/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainManagerRouterPayload, TrainManagerRouterStatusPayload } from '@personalhealthtrain/central-common';
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
    message: TrainManagerRouterPayload<any>,
) : Promise<void> {
    switch (command) {
        case TrainManagerRouterCommand.CHECK: {
            const eventContext = {
                command: TrainManagerRouterCommand.CHECK,
            };
            await Promise.resolve(message as TrainManagerRouterStatusPayload)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(message, {
                    ...eventContext,
                    error: err,
                }));
            break;
        }
        case TrainManagerRouterCommand.ROUTE: {
            const eventContext = {
                command: TrainManagerRouterCommand.ROUTE,
            };

            await Promise.resolve(message)
                .then((data) => writeRoutingEvent(data, eventContext))
                .then(processRouteCommand)
                .then((data) => writeRoutedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(message, {
                    ...eventContext,
                    error: err,
                }));

            break;
        }
        case TrainManagerRouterCommand.START: {
            const eventContext = {
                command: TrainManagerRouterCommand.START,
            };

            await Promise.resolve(message)
                .then(extendPayload)
                .then((data) => writeStartingEvent(data, eventContext))
                .then(processStartCommand)
                .then((data) => writeStartedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(message, {
                    ...eventContext,
                    error: err,
                }));
        }
    }
}
