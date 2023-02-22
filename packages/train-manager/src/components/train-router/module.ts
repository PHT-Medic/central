/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainManagerRouterRoutePayload,
    TrainManagerRouterStartPayload,
    TrainManagerRouterStatusPayload,
} from '@personalhealthtrain/central-common';
import { TrainManagerRouterCommand } from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
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
import { extendPayload } from '../utils';

type ExecutionContext = ComponentExecutionContext<TrainManagerRouterCommand.CHECK, TrainManagerRouterStatusPayload> |
ComponentExecutionContext<TrainManagerRouterCommand.ROUTE, TrainManagerRouterRoutePayload> |
ComponentExecutionContext<TrainManagerRouterCommand.START, TrainManagerRouterStartPayload>;

export async function executeRouterCommand(
    context: ExecutionContext,
) : Promise<void> {
    switch (context.command) {
        case TrainManagerRouterCommand.CHECK: {
            const eventContext = {
                command: TrainManagerRouterCommand.CHECK,
            };

            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(context.data, {
                    ...eventContext,
                    error: err,
                }));
            break;
        }
        case TrainManagerRouterCommand.ROUTE: {
            const eventContext = {
                command: TrainManagerRouterCommand.ROUTE,
            };

            await Promise.resolve(context.data)
                .then((data) => writeRoutingEvent(data, eventContext))
                .then(processRouteCommand)
                .then((data) => writeRoutedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(context.data, {
                    ...eventContext,
                    error: err,
                }));

            break;
        }
        case TrainManagerRouterCommand.START: {
            const eventContext = {
                command: TrainManagerRouterCommand.START,
            };

            await Promise.resolve(extendPayload(context.data))
                .then()
                .then((data) => writeStartingEvent(data, eventContext))
                .then(processStartCommand)
                .then((data) => writeStartedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(context.data, {
                    ...eventContext,
                    error: err,
                }));
        }
    }
}
